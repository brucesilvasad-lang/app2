import { dataService } from './caminho/para/seu/dataService.js'; // ajuste o caminho

async function testeSupabaseCompleto() {
  try {
    // --- Alunos ---
    await dataService.saveStudents([
      { name: 'Bruce', email: 'bruce@teste.com', password: '12345', joinDate: new Date(), notes: 'Aluno teste', avatarUrl: '' },
      { name: 'Ana', email: 'ana@teste.com', password: '12345', joinDate: new Date(), notes: 'Aluno teste', avatarUrl: '' }
    ]);

    // --- Instrutores ---
    await dataService.saveInstructors([
      { name: 'Professor João', email: 'joao@teste.com', password: '12345' },
      { name: 'Professor Maria', email: 'maria@teste.com', password: '12345' }
    ]);

    // --- Aulas ---
    await dataService.saveClasses([
      { class_name: 'Pilates Básico', instructor_id: 1, date: new Date(), enrollments: [], serviceId: 1, capacity: 10 },
      { class_name: 'Pilates Avançado', instructor_id: 2, date: new Date(), enrollments: [], serviceId: 2, capacity: 8 }
    ]);

    // --- Serviços ---
    await dataService.saveServices([
      { name: 'Aula Individual', price: 50 },
      { name: 'Aula em Grupo', price: 30 }
    ]);

    // --- Administradores ---
    await dataService.saveAdmins([
      { name: 'Admin Bruce', email: 'admin@teste.com', password: '12345' }
    ]);

    // --- Despesas ---
    await dataService.saveExpenses([
      { description: 'Compra de colchonetes', amount: 200, date: new Date() },
      { description: 'Pagamento de luz', amount: 150, date: new Date() }
    ]);

    console.log('✅ Todos os dados de teste foram salvos no Supabase!');
  } catch (err) {
    console.error('❌ Erro ao salvar dados de teste:', err);
  }
}

// Executa o teste
testeSupabaseCompleto();
