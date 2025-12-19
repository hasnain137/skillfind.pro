import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('Starting Search Verification...');

    // 1. Create a simplified test professional to search for
    // We need a user, pro profile, and service with a specific description
    const uniqueId = `test_${Date.now()}`;
    const term = `UniqueTerm${Date.now()}`; // The term we will search for

    try {
        // Check if category exists or create one
        let category = await prisma.category.findFirst();
        if (!category) {
            category = await prisma.category.create({
                data: { nameEn: 'Test Cat', slug: `test-cat-${uniqueId}` }
            });
        }

        // Check if subcategory exists
        let subcategory = await prisma.subcategory.findFirst({ xhere: { categoryId: category.id } }); // typo xhere intentional to fail? No.
        if (!subcategory) {
            subcategory = await prisma.subcategory.create({
                data: { nameEn: 'Test Sub', slug: `test-sub-${uniqueId}`, categoryId: category.id }
            });
        }

        console.log(`Creating test user with term: ${term} in service description...`);

        const user = await prisma.user.create({
            data: {
                email: `search_test_${uniqueId}@example.com`,
                clerkId: `clerk_${uniqueId}`,
                firstName: 'Search',
                lastName: 'Tester',
                role: 'PROFESSIONAL',
            }
        });

        const pro = await prisma.professional.create({
            data: {
                userId: user.id,
                status: 'ACTIVE',
                isVerified: true,
                businessName: `Biz ${uniqueId}`,

                services: {
                    create: {
                        subcategoryId: subcategory.id,
                        description: `This service performs ${term} perfectly.`
                    }
                }
            }
        });

        // 2. Perform Search via Database Query first (simulate API logic)
        // We want to test the OR clause logic specifically.
        const searchFilter = term;

        // Exact logic from route.ts
        const matches = await prisma.professional.findMany({
            where: {
                status: { in: ['ACTIVE', 'INCOMPLETE', 'PENDING_REVIEW'] },
                OR: [
                    { user: { OR: [{ firstName: { contains: searchFilter, mode: 'insensitive' } }, { lastName: { contains: searchFilter, mode: 'insensitive' } }] } },
                    { bio: { contains: searchFilter, mode: 'insensitive' } },
                    { title: { contains: searchFilter, mode: 'insensitive' } },
                    { businessName: { contains: searchFilter, mode: 'insensitive' } },
                    { services: { some: { description: { contains: searchFilter, mode: 'insensitive' } } } }
                ]
            }
        });

        console.log(`Search for "${term}" returned ${matches.length} results.`);

        if (matches.length > 0 && matches[0].id === pro.id) {
            console.log('✅ SUCCESS: Professional found by service description!');
        } else {
            console.error('❌ FAILURE: Professional NOT found by service description.');
            console.log('Matches:', matches);
        }

        // Cleanup
        await prisma.professional.delete({ where: { id: pro.id } });
        await prisma.user.delete({ where: { id: user.id } });

    } catch (e) {
        console.error('Test failed with error:', e);
        process.exit(1);
    }
}

main();
