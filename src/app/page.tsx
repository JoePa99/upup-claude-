import ContextBuilderForm from '@/components/ContextBuilderForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="container mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Context Builder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your business intelligence into powerful, personalized AI prompts 
            that drive better customer interactions and higher conversion rates.
          </p>
        </header>
        <ContextBuilderForm />
      </div>
    </main>
  );
}
