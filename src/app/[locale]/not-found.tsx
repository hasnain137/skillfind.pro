import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 text-center">
            <Container>
                <div className="max-w-lg mx-auto space-y-6">
                    {/* 404 Text */}
                    <div className="relative">
                        <span className="text-[150px] font-bold text-blue-100 leading-none block">
                            404
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl">🔍</span>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-[#333333]">Page not found</h1>
                        <p className="text-[#7C7373]">
                            Sorry, we couldn't find the page you're looking for.
                            It might have been moved or doesn't exist.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <Link href="/">
                            <Button className="gap-2 w-full sm:w-auto">
                                <Home className="h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                        <Link href="/search">
                            <Button variant="outline" className="gap-2 w-full sm:w-auto">
                                <Search className="h-4 w-4" />
                                Search Professionals
                            </Button>
                        </Link>
                    </div>

                    {/* Helpful Links */}
                    <div className="pt-6 text-sm text-[#7C7373]">
                        <p className="mb-2">Popular pages:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Link href="/categories" className="text-blue-600 hover:underline">
                                Categories
                            </Link>
                            <span>•</span>
                            <Link href="/search" className="text-blue-600 hover:underline">
                                Find Professionals
                            </Link>
                            <span>•</span>
                            <Link href="/login" className="text-blue-600 hover:underline">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

