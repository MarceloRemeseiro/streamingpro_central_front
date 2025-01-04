import CreateProcessForm from '@/components/CreateProcessForm';

export default function CreatePage() {
  return (
    <div className="container mx-auto py-8">
      <CreateProcessForm />
    </div>
  );
}

export const metadata = {
  title: 'Crear Proceso - StreamingPro',
  description: 'Crea un nuevo proceso de streaming',
}; 