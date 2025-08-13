import { prisma } from '@/lib/db'

// create a lead
await prisma.lead.create({
    data: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        type: 'NEW',
        query: 'Website redesign',
        tags: ['web', 'design'],
    },
})

// add an AI draft for that lead
await prisma.emailDraft.create({
    data: {
        leadId: '<lead-id>',
        subject: 'Website Redesign — Quick Plan',
        body: 'Hi Jane, ...',
        model: 'gpt-4o-mini',
        prompt: 'Warm intro for a new lead interested in redesign',
    },
})
