import { supabase, isCloudEnabled } from '../lib/supabaseClient';
import { Student, Instructor, Class, Expense, Service, StudentLabel, AdminUser } from '../types';

// Chaves para LocalStorage
const KEYS = {
    STUDENTS: 'pilates_students',
    INSTRUCTORS: 'pilates_instructors',
    CLASSES: 'pilates_classes',
    EXPENSES: 'pilates_expenses',
    SERVICES: 'pilates_services',
    LABELS: 'pilates_student_labels',
    ADMINS: 'pilates_admins',
};

// --- FUNÇÃO GENÉRICA PARA CARREGAR DADOS ---
async function loadData<T>(tableName: string, localKey: string, initialData: T): Promise<T> {
    if (isCloudEnabled && supabase) {
        try {
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) throw error;

            if (data && data.length > 0) return data as unknown as T;
        } catch (err) {
            console.warn(`Erro ao carregar ${tableName} da nuvem, tentando local...`, err);
        }
    }

    try {
        const item = window.localStorage.getItem(localKey);
        return item ? JSON.parse(item) : initialData;
    } catch (error) {
        console.error(`Erro localStorage ${localKey}:`, error);
        return initialData;
    }
}

// --- FUNÇÃO GENÉRICA PARA SALVAR DADOS ---
async function saveData(tableName: string, localKey: string, data: any[], formatFn?: (item: any) => any) {
    // 1. Salva local
    try {
        window.localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
        console.error(`Erro ao salvar LocalStorage (${localKey}):`, e);
    }

    // 2. Salva na nuvem
    if (isCloudEnabled && supabase) {
        try {
            if (data.length > 0) {
                const upsertData = formatFn ? data.map(formatFn) : data;
                const { error: upsertError } = await supabase.from(tableName).upsert(upsertData);
                if (upsertError) throw upsertError;
            }

            // Delete automático (exceto classes)
            if (tableName !== 'classes') {
                const { data: dbData, error: fetchError } = await supabase.from(tableName).select('id');
                if (fetchError) throw fetchError;

                const currentIds = new Set(data.map((item: any) => item.id));
                const idsToDelete = dbData
                    .filter((row: any) => !currentIds.has(row.id))
                    .map((row: any) => row.id);

                if (idsToDelete.length > 0) {
                    const { error: deleteError } = await supabase.from(tableName).delete().in('id', idsToDelete);
                    if (deleteError) throw deleteError;
                }
            }

        } catch (err: any) {
            console.error(`Erro de sincronização em ${tableName}:`, err.message || err);
        }
    }
}

// --- EXPORTAR API ---
export const dataService = {
    // STUDENTS
    getStudents: (initial: Student[]) => loadData<Student[]>('students', KEYS.STUDENTS, initial),
    saveStudents: (data: Student[]) => saveData('students', KEYS.STUDENTS, data, item => ({
        name: item.name ?? '',
        email: item.email ?? '',
        password: item.password ?? '',
        joinDate: item.joinDate ?? undefined,
        notes: item.notes ?? '',
        avatarUrl: item.avatarUrl ?? '',
        labels: item.labels ?? [],
    })),

    // INSTRUCTORS
    getInstructors: (initial: Instructor[]) => loadData<Instructor[]>('instructors', KEYS.INSTRUCTORS, initial),
    saveInstructors: (data: Instructor[]) => saveData('instructors', KEYS.INSTRUCTORS, data, item => ({
        name: item.name ?? '',
        email: item.email ?? '',
        password: item.password ?? '',
        phone: item.phone ?? '',
    })),

    // CLASSES
    getClasses: (initial: Class[]) => loadData<Class[]>('classes', KEYS.CLASSES, initial),
    saveClasses: (data: Class[]) => saveData('classes', KEYS.CLASSES, data, item => ({
        date: item.date ?? '',
        instructorId: item.instructorId ?? null,
        enrollments: item.enrollments ?? [],
        class_name: item.class_name ?? '',
        serviceId: item.serviceId ?? null,
        capacity: item.capacity ?? 0,
    })),

    // EXPENSES
    getExpenses: (initial: Expense[]) => loadData<Expense[]>('expenses', KEYS.EXPENSES, initial),
    saveExpenses: (data: Expense[]) => saveData('expenses', KEYS.EXPENSES, data, item => ({
        description: item.description ?? '',
        amount: item.amount ?? 0,
        date: item.date ?? '',
    })),

    // SERVICES
    getServices: (initial: Service[]) => loadData<Service[]>('services', KEYS.SERVICES, initial),
    saveServices: (data: Service[]) => saveData('services', KEYS.SERVICES, data, item => ({
        name: item.name ?? '',
        price: item.price ?? 0,
    })),

    // LABELS
    getLabels: (initial: StudentLabel[]) => loadData<StudentLabel[]>('student_labels', KEYS.LABELS, initial),
    saveLabels: (data: StudentLabel[]) => saveData('student_labels', KEYS.LABELS, data, item => ({
        label: item.label ?? '',
    })),

    // ADMINS
    getAdmins: (initial: AdminUser[]) => loadData<AdminUser[]>('admins', KEYS.ADMINS, initial),
    saveAdmins: (data: AdminUser[]) => saveData('admins', KEYS.ADMINS, data, item => ({
        name: item.name ?? '',
        email: item.email ?? '',
        role: item.role ?? 'admin',
    })),

    // --- Funções de filtro seguras ---
    filterAdminsByRole: (admins: AdminUser[], role: string) =>
        admins.filter(admin => (admin.role ?? '').toLowerCase() === role.toLowerCase()),

    filterStudentsByName: (students: Student[], name: string) =>
        students.filter(student => (student.name ?? '').toLowerCase().includes(name.toLowerCase())),
};
