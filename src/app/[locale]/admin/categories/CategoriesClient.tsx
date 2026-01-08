'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import CategoryDialog from './CategoryDialog';
import SubcategoryDialog from './SubcategoryDialog';

interface Subcategory {
    id: string;
    nameEn: string;
    nameFr?: string;
    description?: string;
}

interface Category {
    id: string;
    slug: string;
    nameEn: string;
    icon?: string;
    isActive: boolean;
    subcategories: Subcategory[];
}

interface CategoriesClientProps {
    categories: Category[];
}

export default function CategoriesClient({ categories }: CategoriesClientProps) {
    // State for Category Dialog
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // State for Subcategory Dialog
    const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    const openCreateCategory = () => {
        setSelectedCategory(null);
        setIsCategoryDialogOpen(true);
    };

    const openEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsCategoryDialogOpen(true);
    };

    const openCreateSubcategory = (categoryId: string) => {
        setActiveCategoryId(categoryId);
        setSelectedSubcategory(null);
        setIsSubcategoryDialogOpen(true);
    };

    const openEditSubcategory = (categoryId: string, subcategory: Subcategory) => {
        setActiveCategoryId(categoryId);
        setSelectedSubcategory(subcategory);
        setIsSubcategoryDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeading
                    eyebrow="Content Management"
                    title="Categories"
                    description="Manage service categories and subcategories."
                />
                <Button onClick={openCreateCategory}>+ New Category</Button>
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
                                <Button
                                    variant="ghost"
                                    className="text-xs"
                                    onClick={() => openEditCategory(category)}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>

                        <div className="pl-13">
                            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7C7373]">
                                Subcategories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {category.subcategories.map((sub) => (
                                    <Badge
                                        key={sub.id}
                                        variant="gray"
                                        className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => openEditSubcategory(category.id, sub)}
                                    >
                                        {sub.nameEn}
                                    </Badge>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="h-6 px-2 text-xs border border-dashed border-gray-300"
                                    onClick={() => openCreateSubcategory(category.id)}
                                >
                                    + Add Subcategory
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <CategoryDialog
                isOpen={isCategoryDialogOpen}
                onClose={() => setIsCategoryDialogOpen(false)}
                category={selectedCategory}
            />

            <SubcategoryDialog
                isOpen={isSubcategoryDialogOpen}
                onClose={() => setIsSubcategoryDialogOpen(false)}
                categoryId={activeCategoryId || ''}
                subcategory={selectedSubcategory}
            />
        </div>
    );
}
