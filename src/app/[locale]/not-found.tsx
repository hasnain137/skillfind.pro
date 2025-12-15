import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-surface-50 px-4 text-center">
            <div className="space-y-4">
                <h1 className="text-9xl font-bold text-surface-200">404</h1>
                <h2 className="text-2xl font-bold text-surface-900">Page not found</h2>
                <p className="text-surface-600 max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>
                <div className="pt-8">
                    <Link href="/">
                        <Button size="lg" className="shadow-soft hover:shadow-medium transition-shadow">
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
