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

// --- SANITIZAÇÃO ---
function sanitizeAdmins(admins: any[]): AdminUser[] {
    return admins.map(a => ({
        id: a.id ?? 0,
        name: a.name ?? '',
        role: a.role ?? 'admin',
        email: a.email ?? '',
    }));
}

function sanitizeStudents(students: any[]): Student[] {
    return students.map(s => ({
        id: s.id ?? 0,
        name: s.name ?? '',
        email: s.email ?? '',
        phone: s.phone ?? '',
        labels: s.labels ?? [],
    }));
}

function sanitizeInstructors(instructors: any[]): Instructor[] {
    return instructors.map(i => ({
        id: i.id ?? 0,
        name: i.name ?? '',
        email: i.email ?? '',
        phone: i.phone ?? '',
    }));
}

function sanitizeClasses(classes: any[]): Class[] {
    return classes.map(c => ({
        id: c.id ?? 0,
        class_name: c.class_name ?? '',
        date: c.date ?? '',
        instructorId: c.instructorId ?? null,
        enrollments: c.enrollments ?? [],
        serviceId: c.serviceId ?? null,
        capacity: c.capacity ?? 0,
    }));
}

function sanitizeExpenses(expenses: any[]): Expense[] {
    return expenses.map(e => ({
        id: e.id ?? 0,
        description: e.description ?? '',
        amount: e.amount ?? 0,
        date: e.date ?? '',
    }));
}

function sanitizeServices(services: any[]): Service[] {
    return services.map(s => ({
        id: s.id ?? 0,
        name: s.name ?? '',
        price: s.price ?? 0,
    }));
}

function sanitizeLabels(labels: any[]): StudentLabel[] {
    return labels.map(l => ({
        id: l.id ?? 0,
        name: l.name ?? '',
        color: l.color ?? '',
    }));
}

// --- FUNÇÃO GENÉRICA PARA CARREGAR DADOS ---
async function loadData<T>(tableName: string, localKey: string, initialData: T): Promise<T> {
    if (isCloudEnabled && supabase) {
        try {
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) throw error;

            if (data && data.length > 0) {
                switch (tableName) {
                    case 'admins': return sanitizeAdmins(data) as unknown as T;
                    case 'students': return sanitizeStudents(data) as unknown as T;
                    case 'instructors': return sanitizeInstructors(data) as unknown as T;
                    case 'classes': return sanitizeClasses(data) as unknown as T;
                    case 'expenses': return sanitizeExpenses(data) as unknown as T;
                    case 'services': return sanitizeServices(data) as unknown as T;
                    case 'student_labels': return sanitizeLabels(data) as unknown as T;
                    default: return data as unknown as T;
                }
            }
        } catch (err) {
            console.warn(`Erro ao carregar ${tableName} da nuvem, tentando local...`, err);
        }
    }

    // fallback local
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
    try {
        window.localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
        console.error(`Erro ao salvar LocalStorage (${localKey}):`, e);
    }

    if (isCloudEnabled && supabase) {
        try {
            if (data.length > 0) {
                const upsertData = formatFn ? data.map(formatFn) : data;
                const { error: upsertError } = await supabase.from(tableName).upsert(upsertData);
                if (upsertError) throw upsertError;
            }

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
    getStudents: (initial: Student[]) => loadData<Student[]>('students', KEYS.STUDENTS, initial),
    saveStudents: (data: Student[]) => saveData('students', KEYS.STUDENTS, data),

    getInstructors: (initial: Instructor[]) => loadData<Instructor[]>('instructors', KEYS.INSTRUCTORS, initial),
    saveInstructors: (data: Instructor[]) => saveData('instructors', KEYS.INSTRUCTORS, data),

    getClasses: (initial: Class[]) => loadData<Class[]>('classes', KEYS.CLASSES, initial),
    saveClasses: (data: Class[]) => saveData('classes', KEYS.CLASSES, data),

    getExpenses: (initial: Expense[]) => loadData<Expense[]>('expenses', KEYS.EXPENSES, initial),
    saveExpenses: (data: Expense[]) => saveData('expenses', KEYS.EXPENSES, data),

    getServices: (initial: Service[]) => loadData<Service[]>('services', KEYS.SERVICES, initial),
    saveServices: (data: Service[]) => saveData('services', KEYS.SERVICES, data),

    getLabels: (initial: StudentLabel[]) => loadData<StudentLabel[]>('student_labels', KEYS.LABELS, initial),
    saveLabels: (data: StudentLabel[]) => saveData('student_labels', KEYS.LABELS, data),

    getAdmins: (initial: AdminUser[]) => loadData<AdminUser[]>('admins', KEYS.ADMINS, initial),
    saveAdmins: (data: AdminUser[]) => saveData('admins', KEYS.ADMINS, data),

    // --- Funções de filtro seguras ---
    filterAdminsByRole: (admins: AdminUser[], role: string) =>
        admins.filter(admin => (admin.role ?? '').toLowerCase() === role.toLowerCase()),

    filterStudentsByName: (students: Student[], name: string) =>
        students.filter(student => (student.name ?? '').toLowerCase().includes(name.toLowerCase())),
};
