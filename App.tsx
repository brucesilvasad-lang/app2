import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Student, Instructor, Class, Expense, Service, StudentLabel, AdminUser, ActiveView, CurrentUser, UserRole, AttendanceStatus, Enrollment, AppDataBackup, Theme, ColorTheme } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import Schedule from './components/Schedule';
import InstructorManagement from './components/InstructorManagement';
import Expenses from './components/Expenses';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import OnboardingGuide from './components/OnboardingGuide';
import { dataService } from './services/dataService';
import { isCloudEnabled } from './lib/supabaseClient';
import { Loader2, CheckCircle2, CloudOff, Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Color Palettes
const colorPalettes: Record<ColorTheme, { primary: string; secondary: string; light: string; accent: string; bg: string }> = {
    nature: { primary: '#4A5C58', secondary: '#8AA39B', light: '#D4E0DC', accent: '#C2958F', bg: '#F7F9F8' },
    ocean: { primary: '#0f766e', secondary: '#2dd4bf', light: '#ccfbf1', accent: '#f59e0b', bg: '#f0fdfa' },
    royal: { primary: '#1e40af', secondary: '#60a5fa', light: '#dbeafe', accent: '#f59e0b', bg: '#eff6ff' },
    sunset: { primary: '#c2410c', secondary: '#fb923c', light: '#ffedd5', accent: '#0ea5e9', bg: '#fff7ed' },
};

// Initial Fallback Data
const initialStudents: Student[] = [];
const initialAdmins: AdminUser[] = [];
const initialInstructors: Instructor[] = [];
const initialClasses: Class[] = [];
const initialExpenses: Expense[] = [];
const initialServices: Service[] = [];
const initialStudentLabels: StudentLabel[] = [];

const App: React.FC = () => {
    // --- States ---
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>(ActiveView.DASHBOARD);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const [students, setStudents] = useState<Student[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [studentLabels, setStudentLabels] = useState<StudentLabel[]>([]);

    const [theme, setTheme] = useState<Theme>('light');
    const [colorTheme, setColorTheme] = useState<ColorTheme>('nature');

    // --- Load Data ---
    useEffect(() => {
        const loadAll = async () => {
            setIsLoading(true);
            const [s, a, i, c, e, serv, l] = await Promise.all([
                dataService.getStudents(initialStudents),
                dataService.getAdmins(initialAdmins),
                dataService.getInstructors(initialInstructors),
                dataService.getClasses(initialClasses),
                dataService.getExpenses(initialExpenses),
                dataService.getServices(initialServices),
                dataService.getLabels(initialStudentLabels),
            ]);

            setStudents(s);
            setAdmins(a);
            setInstructors(i);
            setClasses(c);
            setExpenses(e);
            setServices(serv);
            setStudentLabels(l);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    // --- Auto Save ---
    const handleSave = useCallback(async (saveFn: () => Promise<void>) => {
        setIsSaving(true);
        try { await saveFn(); } finally { setTimeout(() => setIsSaving(false), 500); }
    }, []);

    useEffect(() => { if (!isLoading) handleSave(() => dataService.saveStudents(students)); }, [students, isLoading, handleSave]);
    useEffect(() => { if (!isLoading) handleSave(() => dataService.saveAdmins(admins)); }, [admins, isLoading, handleSave]);
    useEffect(() => { if (!isLoading) handleSave(() => dataService.saveInstructors(instructors)); }, [instructors, isLoading, handleSave]);
    useEffect(() => { if (!isLoading) handleSave(() => dataService.saveClasses(classes)); }, [classes, isLoading, handleSave]);
    useEffect(() => { if (!isLoading) handleSave(() => dataService.saveExpenses(expenses)); }, [expenses, isLoading, handleSave]);
    useEffect(() => { if (!isLoading) handleSave(() => dataService.saveServices(services)); }, [services, isLoading, handleSave]);
    useEffect(() => { if (!isLoading) handleSave(() => dataService.saveLabels(studentLabels)); }, [studentLabels, isLoading, handleSave]);

    // --- Theme ---
    useEffect(() => {
        document.documentElement.classList.remove(theme === 'light' ? 'dark' : 'light');
        document.documentElement.classList.add(theme);
        window.localStorage.setItem('pilates_theme', theme);
    }, [theme]);

    useEffect(() => {
        const colors = colorPalettes[colorTheme];
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => root.style.setProperty(`--color-brand-${key}`, value));
        window.localStorage.setItem('pilates_color_theme', colorTheme);
    }, [colorTheme]);

    // --- Login / Logout ---
    const handleLogin = (role: UserRole, id?: string) => {
        if (role === UserRole.ADMIN && id) {
            const admin = admins.find(a => a.id === id);
            if (admin) setCurrentUser({ role, name: admin.name });
        } else if (role === UserRole.STUDENT && id) {
            const student = students.find(s => s.id === id);
            if (student) setCurrentUser({ role, studentId: id, name: student.name });
        }
        setActiveView(ActiveView.DASHBOARD);
    };
    const handleLogout = () => setCurrentUser(null);

    // --- CRUD Helpers ---
    const addStudent = (s: Omit<Student, 'id'>) => setStudents(prev => [...prev, { ...s, id: `s${Date.now()}` }]);
    const addAdmin = (a: Omit<AdminUser, 'id'>) => setAdmins(prev => [...prev, { ...a, id: `adm${Date.now()}` }]);
    const addInstructor = (i: Omit<Instructor, 'id'>) => setInstructors(prev => [...prev, { ...i, id: `i${Date.now()}` }]);
    const addExpense = (e: Omit<Expense, 'id'>) => setExpenses(prev => [...prev, { ...e, id: `exp${Date.now()}` }]);
    const addService = (s: Omit<Service, 'id'>) => setServices(prev => [...prev, { ...s, id: `serv${Date.now()}` }]);
    const addLabel = (l: Omit<StudentLabel, 'id'>) => setStudentLabels(prev => [...prev, { ...l, id: `lab${Date.now()}` }]);

    const updateStudent = (s: Student) => setStudents(prev => prev.map(x => x.id === s.id ? s : x));
    const updateService = (s: Service) => setServices(prev => prev.map(x => x.id === s.id ? s : x));

    const removeService = (id: string) => setServices(prev => prev.filter(x => x.id !== id));
    const removeLabel = (id: string) => setStudentLabels(prev => prev.filter(x => x.id !== id));

    // --- Backup / Restore ---
    const getBackup = (): AppDataBackup => ({
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: { students, instructors, classes, expenses, services, studentLabels, admins }
    });
    const restoreBackup = (backup: AppDataBackup) => {
        setStudents(backup.data.students);
        setInstructors(backup.data.instructors);
        setClasses(backup.data.classes);
        setExpenses(backup.data.expenses);
        setServices(backup.data.services);
        setStudentLabels(backup.data.studentLabels);
        setAdmins(backup.data.admins);
    };

    // --- View Content ---
    const viewContent = useMemo(() => {
        if (!currentUser) return null;
        const isAdmin = currentUser.role === UserRole.ADMIN;

        switch (activeView) {
            case ActiveView.STUDENTS: return isAdmin ? <StudentManagement students={students} addStudent={addStudent} updateStudent={updateStudent} classes={classes}/> : null;
            case ActiveView.SCHEDULE: return <Schedule allDayClasses={classes} students={students} updateClassesForDay={() => {}} isReadOnly={!isAdmin} currentStudentId={currentUser.studentId}/>;
            case ActiveView.INSTRUCTORS: return isAdmin ? <InstructorManagement instructors={instructors} addInstructor={addInstructor} /> : null;
            case ActiveView.EXPENSES: return isAdmin ? <Expenses expenses={expenses} addExpense={addExpense} /> : null;
            case ActiveView.ACCOUNTING: return isAdmin ? <Accounting classes={classes} expenses={expenses} /> : null;
            case ActiveView.SETTINGS: return isAdmin ? <Settings theme={theme} setTheme={setTheme} colorTheme={colorTheme} setColorTheme={setColorTheme} services={services} addService={addService} updateService={updateService} removeService={removeService} studentLabels={studentLabels} addStudentLabel={addLabel} removeStudentLabel={removeLabel} onImportData={restoreBackup} onExportData={getBackup} /> : null;
            case ActiveView.DASHBOARD:
            default: return isAdmin ? <Dashboard students={students} classes={classes} instructors={instructors} expenses={expenses} services={services} /> : <StudentDashboard student={students.find(s => s.id === currentUser.studentId)!} classes={classes} />;
        }
    }, [activeView, currentUser, students, instructors, classes, expenses, services, studentLabels, theme, colorTheme]);

    // --- Loading Screen ---
    if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin w-10 h-10" /></div>;
    if (!currentUser) return <Login students={students} admins={admins} onLogin={handleLogin} onRegister={addStudent} onAdminRegister={addAdmin} />;

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Toaster position="top-right" />
            <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
                <Sidebar activeView={activeView} setActiveView={setActiveView} closeSidebar={() => setSidebarOpen(false)} userRole={currentUser.role} onLogout={handleLogout} onOpenGuide={() => setShowGuide(true)} />
            </div>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white border-b lg:hidden">
                    <h1 className="text-xl font-bold">PilarisControl</h1>
                    <button onClick={() => setSidebarOpen(true)}><Menu /></button>
                </header>
                <div className="flex-1 overflow-auto p-4">
                    <div className="flex justify-end mb-4">
                        {isCloudEnabled ? (
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isSaving ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {isSaving ? <> <Loader2 className="animate-spin mr-2 w-3 h-3"/> Sincronizando...</> : <> <CheckCircle2 className="mr-1 w-3 h-3"/> Salvo na Nuvem</>}
                            </div>
                        ) : (
                            <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                                <CloudOff className="mr-1 w-3 h-3"/> Modo Offline
                            </div>
                        )}
                    </div>
                    {viewContent}
                </div>
            </main>
            <OnboardingGuide isOpen={showGuide} onClose={() => setShowGuide(false)} role={currentUser.role} />
        </div>
    );
};

export default App;
