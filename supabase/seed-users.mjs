import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Load .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const dummyUsers = [
    {
        email: 'doctor@ehcp.com',
        id_placeholder: '00000000-0000-0000-0000-000000000001',
        password: 'Password123!',
        full_name: 'Dr. Michael Vance',
        role: 'DOCTOR',
        specialty: 'Genomics & Precision Medicine'
    },
    {
        email: 'nurse@ehcp.com',
        id_placeholder: '00000000-0000-0000-0000-000000000002',
        password: 'Password123!',
        full_name: 'Nurse Sarah Wilson',
        role: 'NURSE',
        specialty: 'Emergency Triage'
    },
    {
        email: 'admin@ehcp.com',
        id_placeholder: '00000000-0000-0000-0000-000000000003',
        password: 'Password123!',
        full_name: 'Admin Caroline',
        role: 'ADMIN',
        specialty: 'System Operations'
    }
]

async function seedUsers() {
    console.log('🚀 Starting user seeding and SQL update...')

    const seedFilePath = path.resolve(__dirname, 'seed.sql')
    if (!fs.existsSync(seedFilePath)) {
        console.error(`Error: ${seedFilePath} not found!`)
        process.exit(1)
    }

    let seedSql = fs.readFileSync(seedFilePath, 'utf8')
    console.log('Original seed.sql loaded.')

    const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
        console.error('Error listing users:', listError.message)
        process.exit(1)
    }

    for (const userDef of dummyUsers) {
        console.log(`\n--- Processing: ${userDef.email} ---`)

        let userId;
        const existingUser = listData.users.find(u => u.email === userDef.email)

        if (existingUser) {
            userId = existingUser.id
            console.log(`User exists. ID: ${userId}`)
        } else {
            console.log(`Creating new auth user...`)
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: userDef.email,
                password: userDef.password,
                email_confirm: true,
                user_metadata: { full_name: userDef.full_name, role: userDef.role }
            })
            if (authError) {
                console.error(`Failed to create ${userDef.email}:`, authError.message)
                continue
            }
            userId = authData.user.id
            console.log(`✅ Auth user created: ${userId}`)
        }

        // 2. Profile Sync
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            full_name: userDef.full_name,
            role: userDef.role,
            specialty: userDef.specialty,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userDef.full_name.split(' ')[1]}`
        })

        if (profileError) console.error(`Profile error:`, profileError.message)
        else console.log(`✅ Profile synced.`)

        // 3. String Replacement
        const placeholderCount = (seedSql.match(new RegExp(userDef.id_placeholder, 'g')) || []).length
        console.log(`Replacing ${placeholderCount} occurrences of ${userDef.id_placeholder} with ${userId}`)
        seedSql = seedSql.split(userDef.id_placeholder).join(userId)
    }

    fs.writeFileSync(seedFilePath, seedSql)
    console.log('\n✅ seed.sql OVERWRITTEN with real User IDs')
    console.log('🏁 Process complete.')
}

seedUsers()
