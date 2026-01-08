
import TranslationManager from "@/components/admin/TranslationManager";

export const metadata = {
    title: "Translation Manager"
};

export default function TranslationsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Translation Manager</h1>
                <p className="text-gray-500">
                    Manage your application's text content. Edits are live instantly.
                    <br />
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded ml-0">Auto-Detection: ON</span>
                </p>
            </div>

            <TranslationManager initialLocales={['en', 'fr']} />
        </div>
    );
}
