"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Float, Html, useGLTF, ContactShadows, PresentationControls } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// Loading state for the 3D model
function ModelLoader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] text-white font-bold uppercase tracking-widest">Loading Anatomy...</p>
            </div>
        </Html>
    );
}

// Realistic Human Model
function HumanModel() {
    // Using a high-quality, stable humanoid model from Three.js examples
    // This model is specifically designed for technical/rigging demos
    const { scene } = useGLTF("https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Xbot.glb");

    // Apply material properties to make it look technical/premium for a clinical app
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
                // Ensure the model has a clean, medical "digital twin" look
                child.material.transparent = true;
                child.material.opacity = 0.85;
                child.material.roughness = 0.2;
                child.material.metalness = 0.4;
                child.material.color = new THREE.Color("#cbd5e1"); // Soft slate color
            }
        }
    });

    // Adjusting scale and position for the Xbot model
    return <primitive object={scene} scale={1.8} position={[0, -1.8, 0]} />;
}

function Hotspot({ position, severity, label, onClick }: {
    position: [number, number, number],
    severity: "HIGH" | "MEDIUM" | "LOW",
    label: string,
    onClick: () => void
}) {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            const scale = 1 + Math.sin(t * 3) * 0.1;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    const colors = {
        HIGH: "#f43f5e",
        MEDIUM: "#f59e0b",
        LOW: "#0ea5e9"
    };

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onClick}
            >
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                    color={colors[severity]}
                    emissive={colors[severity]}
                    emissiveIntensity={hovered ? 2 : 1}
                />
            </mesh>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-card/90 backdrop-blur-md border border-border shadow-xl px-2 py-1 rounded text-[10px] text-white whitespace-nowrap">
                        {label}
                    </div>
                </Html>
            )}
        </group>
    );
}

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function BodyMap3D({ patientId }: { patientId?: string }) {
    const supabase = createClient();
    const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

    const { data: hotspots, isLoading } = useQuery({
        queryKey: ["hotspots", patientId],
        queryFn: async () => {
            if (!patientId) return [];
            const { data, error } = await supabase
                .from("body_map_hotspots")
                .select("*")
                .eq("patient_id", patientId);

            if (error) throw error;
            return data.map(spot => ({
                id: spot.id,
                position: [Number(spot.x_coord), Number(spot.y_coord), Number(spot.z_coord)] as [number, number, number],
                severity: spot.severity,
                label: spot.label,
                description: spot.description
            }));
        },
        enabled: !!patientId
    });

    return (
        <div className="relative w-full h-[600px] bg-slate-950 rounded-3xl border border-border/50 overflow-hidden group">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} />
                <OrbitControls enablePan={false} maxDistance={6} minDistance={2} />
                <Environment preset="night" />
                <ambientLight intensity={0.2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />

                <Suspense fallback={<ModelLoader />}>
                    <PresentationControls
                        global
                        config={{ mass: 2, tension: 500 }}
                        snap={{ mass: 4, tension: 1500 }}
                        rotation={[0, 0, 0]}
                        polar={[-Math.PI / 3, Math.PI / 3]}
                        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                    >
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                            <HumanModel />
                            {isLoading ? null : (hotspots || []).map((spot) => (
                                <Hotspot
                                    key={spot.id}
                                    position={spot.position}
                                    severity={spot.severity as any}
                                    label={spot.label}
                                    onClick={() => setSelectedHotspot(spot)}
                                />
                            ))}
                        </Float>
                    </PresentationControls>
                    <ContactShadows
                        position={[0, -2, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2}
                        far={4}
                    />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-6 left-6 space-y-2 pointer-events-none text-white z-10">
                <h3 className="text-xl font-bold tracking-tight">Interactive Anatomical View</h3>
                <p className="text-sm text-muted-foreground">3D Mapping of Clinical Conditions</p>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-border/50 text-[10px] text-white">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        Critical
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-border/50 text-[10px] text-white">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Warning
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-border/50 text-[10px] text-white">
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                        Normal
                    </div>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Use Mouse to Rotate • Scroll to Zoom
                </div>
            </div>

            {selectedHotspot && (
                <div className="absolute top-6 right-6 w-72 p-5 rounded-2xl bg-card border border-primary/30 shadow-2xl animate-in slide-in-from-right-4 duration-300 z-20">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Condition Details</span>
                        <button onClick={() => setSelectedHotspot(null)} className="text-muted-foreground hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{selectedHotspot.label}</h4>
                    <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            selectedHotspot.severity === "CRITICAL" || selectedHotspot.severity === "HIGH" ? "bg-rose-500" : selectedHotspot.severity === "MEDIUM" ? "bg-amber-500" : "bg-sky-500"
                        )} />
                        <span className="text-xs text-muted-foreground capitalize font-medium">{selectedHotspot.severity.toLowerCase()} Severity</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                        {selectedHotspot.description || "No detailed clinical description provided for this anatomical location."}
                    </p>
                    <button className="w-full h-10 bg-primary/10 border border-primary/30 rounded-xl text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest">
                        View Detailed History
                    </button>
                </div>
            )}
        </div>
    );
}
