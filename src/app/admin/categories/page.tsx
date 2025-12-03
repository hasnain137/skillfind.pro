import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import CreateCategoryButton from './CreateCategoryButton';

export default async function AdminCategoriesPage() {
    const categories = await prisma.category.findMany({
        include: {
            subcategories: true,
            _count: {
                select: { requests: true },
            },
        },
        orderBy: { sortOrder: 'asc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeading
                    eyebrow="Content Management"
                    title="Categories"
                    description="Manage service categories and subcategories."
                />
                <CreateCategoryButton />
            </div>

            <div className="grid gap-6">
                {categories.map((category) => (
                    <Card key={category.id} padding="lg">
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                                    {category.icon || '📁'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#333333]">{category.nameEn}</h3>
                                    <p className="text-xs text-[#7C7373]">/{category.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={category.isActive ? 'success' : 'gray'}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Button variant="ghost" className="text-xs">Edit</Button>
                            </div>
                        </div>

                        <div className="pl-13">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7C7373]">
                                Subcategories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {category.subcategories.map((sub) => (
                                    <Badge key={sub.id} variant="gray" className="bg-gray-50">
                                        {sub.nameEn}
                                    </Badge>
                                ))}
                                <Button variant="ghost" className="h-6 px-2 text-xs border border-dashed border-gray-300">
                                    + Add Subcategory
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
