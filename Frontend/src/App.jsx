import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import HomePage from './Pages/HomePage'
import AllLogin from './Pages/AllLogin'
import AdminLogin from './Pages/AdminLogin'
import Dashboard from './Pages/Dashboard'
import Stafflogin from './Pages/StaffLogin'
import StudentLogin from './Pages/StudentLogin'
import ResetPassword from './Pages/ResetPassword'
import Logout from './Pages/Logout'
import StudentAttendance from './Pages/StudentAttendance'
import UpdateStaff from './Pages/UpdateStaff'
import UpdateStudent from './Pages/UpdateStudent'
import ViewStaff from './Pages/ViewStaff'
import ViewStudent from './Pages/ViewStudent'
import Registration from './Pages/StaffRegistration'
import StudentRegistration from './Pages/StudentRegistration'
import UpdateDepartment from './Pages/UpdateDepartment'
import ViewDepartment from './Pages/ViewDepartment'
import DeptRegistration from './Pages/DepartRegistration'
import StaffProfile from './Pages/StaffProfile'
import StudentDashboard from './Pages/StudentDashboard'
import StaffDashboard from './Pages/StaffDashboard'
import StudentProfile from './Pages/StudentProfile'
import Notices from './Pages/Notices'
import ViewNotices from './Pages/ViewNotices'
import ViewFeedback from './Pages/ViewFeedback'
import ViewBook from './Pages/ViewBook'
import UpdateSalary from './Pages/UpdateSalary'
import Feedback from './Pages/Feedback'
import Test from './Pages/Test'
import SalaryRegister from './Pages/SalaryRegister'
import AddBook from './Pages/AddBook'
import ViewSalary from './Pages/ViewSalary'
import ViewAssignment from './Pages/ViewAssignment'
import AssFeed from './Pages/AssFeed'
import Assignment from './Pages/Assignment'
import ViewAssFeed from './Pages/ViewAssFeed'
import AssignmentSubmission from './Pages/AssignmentSubmission'
import ViewSubmissions from './Pages/ViewSubmission'
import StuAttendance from './Pages/StuAttendance'
import StaffAttendance from './Pages/StaffAttendance'
import Managebook from './Pages/Managebook'
import AdminIssuedBooks from './Pages/AdminIssuedBooks'
import Admission from './Pages/Admission'
import Adminprofile from './Pages/Adminprofile'
import FeePayment from './Pages/Payfee'
import ViewTest from './Pages/viewTest'
import QuizDetails from './Pages/Quiz'
import Viewresult from './Pages/Viewresult'
import SubjectRegistration from './Pages/SubjectRegistration'
import ExamMarksRegistration from './Pages/marks'
import RoomAvailabilityComponent from './Pages/room'
import Viewroom from './Pages/Viewroom'
import HostelRegistrationForm from './Pages/hostel'
import BusConditionUpdate from './Pages/transportcondition'
import BusConditionView from './Pages/transportconditionview'
import DriverDetailsForm from './Pages/driverdetail'
import ViewDrivers from './Pages/viewdriver'
import AddRoutes from './Pages/addroutes'
import ViewRoutes from './Pages/viewRoutes'
import TransportRegister from './Pages/studenttransportdetails'
import StudentTransportDetails from './Pages/stutranviewadmin'
import ViewNoticess from './Pages/ViewNotice2'
import StudentTransportDashboard from './Pages/StudentTransport'
import StudentFeePortal from './Pages/hostelfee'
import DeleteBooks from './Pages/ViewBook2'
import ReportCard from './Pages/Reportcard'
import UT1ReportCard from './Pages/ut1'
import UT2ReportCard from './Pages/ut2'
import MidTermReportCard from './Pages/midterm'
import FinalReportCard from './Pages/final'
import ViewStaffProfile from './Pages/viewstaffprofile'
import ProfileStudent from './Pages/StudentById'
import LiveTracker from './Pages/LiveTracker'
import StudentSubmissions from './Pages/StudentSubmissions'
import Register from './Pages/Register'

const dashboardRoutes = {
  '/dashboard': '/Dashboard',
  '/staffdashboard': '/StaffDashboard',
  '/studentdashboard': '/StudentDashboard',
}

const dashboardOnlyPaths = new Set(Object.keys(dashboardRoutes))
const pathsWithoutDashboardBack = new Set([
  '/',
  '/register',
  '/alllogin',
  '/adminlogin',
  '/stafflogin',
  '/studentlogin',
  '/resetpassword',
  '/logout',
  ...dashboardOnlyPaths,
])

const staffPagePrefixes = [
  '/staffprofile',
  '/viewsubmission',
  '/assfeed',
  '/assignment',
  '/stuattendance',
  '/staffviewstudents',
  '/subjectregistration',
  '/marks',
  '/test',
  '/staffattendance',
]

const studentPagePrefixes = [
  '/studentprofile',
  '/viewtest',
  '/reportcard',
  '/viewassignment',
  '/viewassfeed',
  '/studenttransportdetails',
  '/studenttransportalldetails',
  '/payfee',
  '/hostelregistration',
  '/hostelfees',
  '/issued',
]

const hasCookie = (name) => document.cookie
  .split(';')
  .some((cookie) => cookie.trim().startsWith(`${name}=`))

function DashboardBackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname.toLowerCase()
  const rememberedDashboard = sessionStorage.getItem('dashboardPath')
  const dashboardPath = dashboardRoutes[currentPath]

  useEffect(() => {
    if (dashboardPath) {
      sessionStorage.setItem('dashboardPath', dashboardPath)
    }
  }, [dashboardPath])

  if (pathsWithoutDashboardBack.has(currentPath)) return null

  const fallbackDashboard = staffPagePrefixes.some((prefix) => currentPath.startsWith(prefix))
    ? '/StaffDashboard'
    : studentPagePrefixes.some((prefix) => currentPath.startsWith(prefix))
      ? '/StudentDashboard'
      : hasCookie('emstoken')
        ? '/StaffDashboard'
        : hasCookie('token')
          ? '/StudentDashboard'
          : '/Dashboard'

  const targetDashboard = rememberedDashboard || fallbackDashboard

  return (
    <button
      type="button"
      onClick={() => navigate(targetDashboard)}
      aria-label="Back to dashboard"
      style={{
        position: 'fixed',
        left: 20,
        bottom: 20,
        zIndex: 1500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 16px',
        border: 0,
        borderRadius: 999,
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 55%, #7c3aed 100%)',
        color: '#fff',
        boxShadow: '0 6px 18px rgba(79, 70, 229, 0.32)',
        font: 'inherit',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-2px)'
        event.currentTarget.style.boxShadow = '0 9px 22px rgba(79, 70, 229, 0.4)'
        event.currentTarget.style.filter = 'brightness(1.06)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateY(0)'
        event.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 70, 229, 0.32)'
        event.currentTarget.style.filter = 'none'
      }}
    >
      <ArrowBack fontSize="small" />
      Back to Dashboard
    </button>
  )
}

function App() {
  return (
    <BrowserRouter>
        <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/Register' element={<Register/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/AllLogin' element={<AllLogin/>}/>
        <Route path='/AdminLogin' element={<AdminLogin/>}/>
        <Route path='/logout' element={<Logout/>}/>
        <Route path='/Dashboard' element={<Dashboard/>}/>
        <Route path='/StaffLogin' element={<Stafflogin/>}/>
        <Route path='/StudentLogin' element={<StudentLogin/>}/>
        <Route path='/ResetPassword' element={<ResetPassword/>}/>
        <Route path='/UpdateStaff/:staffId' element={<UpdateStaff/>}/>
        <Route path='/UpdateStudent/:id' element={<UpdateStudent/>}/>
        <Route path='/ViewStaff' element={<ViewStaff/>}/>
        <Route path='/ViewStudent' element={<ViewStudent/>}/>
        <Route path='/StaffViewStudents' element={<ViewStudent staffView/>}/>
        <Route path='/StudentAttendance/:id' element={<StudentAttendance/>}/>
        <Route path='/StaffStudentAttendance/:id' element={<StudentAttendance staffView/>}/>
        <Route path='/StaffRegistration' element={<Registration/>}/>
        <Route path='/StudentRegistration' element={<StudentRegistration/>}/>
        <Route path='/UpdateDepartment/:deptId' element={<UpdateDepartment/>}/>
        <Route path='/ViewDepartment' element={<ViewDepartment/>}/>
        <Route path='/DeptRegistration' element={<DeptRegistration/>}/>
        <Route path='/StaffProfile' element={<StaffProfile/>}/>
        <Route path='/StudentDashboard' element={<StudentDashboard/>}/>
        <Route path='/StaffDashboard' element={<StaffDashboard/>}/>
        <Route path='/StudentProfile' element={<StudentProfile/>}/>
        <Route path='/Notice' element={<Notices/>}/>
        <Route path='/ViewNotices' element={<ViewNotices/>}/>
        <Route path='/ViewFeedback' element={<ViewFeedback/>}/>
        <Route path='/AddBook' element={<AddBook/>}/>
        <Route path='/ViewBook' element={<ViewBook/>}/>
        <Route path='/UpdateSalary/:salaryId' element={<UpdateSalary/>}/>
        <Route path='/Test' element={<Test/>}/>
        <Route path='/SalaryRegistration' element={<SalaryRegister/>}/>
        <Route path='/Feedback' element={<Feedback/>}/>
        <Route path='/ViewSalary' element={<ViewSalary/>}/>
        <Route path='/AssFeed/:submissionId' element={<AssFeed/>}/>
        <Route path='/Assignment' element={<Assignment/>}/>
        <Route path='/ViewAssFeed' element={<ViewAssFeed/>}/>
        <Route path='/AssignmentSubmission/:assignmentId' element={<AssignmentSubmission/>}/>
        <Route path='/ViewSubmission' element={<ViewSubmissions/>}/>
        <Route path='/ViewAssignment' element={<ViewAssignment/>}/>
        <Route path='/StuAttendance' element={<StuAttendance/>}/>
        <Route path='/StaffAttendance' element={<StaffAttendance/>}/>
        <Route path='/StaffAttendance/:staffId' element={<StaffAttendance/>}/>
        <Route path='/issued' element={<Managebook/>}/>
        <Route path='/AdminIssuedBooks' element={<AdminIssuedBooks/>}/>
        <Route path='/Admission' element={<Admission/>}/>
        <Route path='/Adminprofile' element={<Adminprofile/>}/>
        <Route path='/payfee' element={<FeePayment/>}/>
        <Route path='/Managebook' element={<Managebook/>}/>
        <Route path='/viewTest' element={<ViewTest/>}/>
        <Route path="/view-test/:title" element={<QuizDetails />} />
        <Route path='/viewresult/:title' element={<Viewresult/>}/>
        <Route path='/SubjectRegistration' element={<SubjectRegistration/>}/>
        <Route path='/marks' element={<ExamMarksRegistration/>}/>  
        <Route path='/addroom' element={<RoomAvailabilityComponent/>}/>
        <Route path='/Viewroom' element={<Viewroom/>}/>
        <Route path='/hostelregistration' element={<HostelRegistrationForm/>}/> 
        <Route path='/busconditionupdate' element={<BusConditionUpdate/>}/>
        <Route path='/busconditionview' element={<BusConditionView/>}/>
        <Route path='/driverdetail' element={<DriverDetailsForm/>}/>
        <Route path='/driverdetailview' element={<ViewDrivers/>}/>
        <Route path='/addroute' element={<AddRoutes/>}/>
        <Route path='/viewroutes' element={<ViewRoutes/>}/>
        <Route path='/studenttransportdetails' element={<TransportRegister/>}/>
        <Route path='/viewallstudenttransport' element={<StudentTransportDetails/>}/>
        <Route path='/ViewNotice2' element={<ViewNoticess/>}/>
        <Route path='/StudentTransportAllDetails' element={<StudentTransportDashboard/>}/>
        <Route path='/hostelfees' element={<StudentFeePortal/>}/>
        <Route path='/ViewBook2' element={<DeleteBooks/>}/>
        <Route path='/reportcard' element={<ReportCard/>}/>
        <Route path='/ut1' element={<UT1ReportCard/>}/>
        <Route path='/ut2' element={<UT2ReportCard/>}/>
        <Route path='/midterm' element={<MidTermReportCard/>}/>
        <Route path='/final' element={<FinalReportCard/>}/>
        <Route path='/viewbyidstaff/:staffId' element={<ViewStaffProfile/>}/>
        <Route path='/ProfileStudent/:id' element={<ProfileStudent/>}/>
        <Route path='/StaffStudentProfile/:id' element={<ProfileStudent staffView/>}/>
        <Route path='/liveTracker' element={<LiveTracker/>}/>
        <Route path='/sviewsubmission' element={<StudentSubmissions/>}/>
        </Routes>
        <DashboardBackButton />
    </BrowserRouter>
  );
}

export default App
