import { createBrowserRouter } from 'react-router-dom';
import {
  MainLayout,
  AuthLayout,
  SidebarLayout,
  ClubSideBar,
  MyPageSidebar,
} from './components/layout';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterStep2 from './pages/auth/RegisterStep2';
import RegisterStep3 from './pages/auth/RegisterStep3';
import RegisterComplete from './pages/auth/RegisterComplete';
import FindId from './pages/auth/FindId';
import FindPassword from './pages/auth/FindPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Community from '@pages/community/Community';
import CommunityDetail from './pages/community/CommunityDetail';
import PostDetail from './pages/community/PostDetail';
import PostWrite from './pages/community/PostWrite';
import DashBoard from './pages/club/clubdashboard/Dashboard';
import Schedule from './pages/schedule/Schedule';
import ClubMembers from './pages/club/clubmember/ClubMembers';
import Notice from './pages/notice/Notice';
import NoticeDetail from './pages/notice/NoticeDetail';
import NoticeWrite from './pages/notice/NoticeWrite';
import NoticeEdit from './pages/notice/NoticeEdit';
import ClubManagement from './pages/club/ClubManagement';
import MyPageProfile from './pages/mypage/MyPageProfile';
import ProfileEdit from './pages/mypage/ProfileEdit';
import ChangePassword from './pages/mypage/ChangePassword';
import AccountWithdrawal from './pages/mypage/AccountWithdrawal';
import Gallery from './pages/gallery/Gallery';
import ClubProfile from './pages/club/ClubProfile';
import MyActivities from './pages/myactivity/MyActivities';
import ClubDetailNew from './pages/club/ClubDetailNew';
import ClubSearch from './pages/club/ClubSearch';
import ClubList from './pages/club/ClubList';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: '/signup/step2',
    element: (
      <AuthLayout>
        <RegisterStep2 />
      </AuthLayout>
    ),
  },
  {
    path: '/signup/step3',
    element: (
      <AuthLayout>
        <RegisterStep3 />
      </AuthLayout>
    ),
  },
  {
    path: '/signup/complete',
    element: (
      <AuthLayout>
        <RegisterComplete />
      </AuthLayout>
    ),
  },
  {
    path: '/find-id',
    element: (
      <AuthLayout>
        <FindId />
      </AuthLayout>
    ),
  },
  {
    path: '/find-password',
    element: (
      <AuthLayout>
        <FindPassword />
      </AuthLayout>
    ),
  },
  {
    path: '/auth/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/reset-password',
    element: (
      <AuthLayout>
        <ResetPassword />
      </AuthLayout>
    ),
  },
  {
    path: '/clubs/search',
    element: (
      <MainLayout>
        <ClubSearch />
      </MainLayout>
    ),
  },
  {
    path: '/clubs/list',
    element: (
      <MainLayout>
        <ClubList />
      </MainLayout>
    ),
  },
  {
    path: '/clubs/:clubId/dashboard',
    element: (
      <SidebarLayout sidebar={<ClubSideBar />}>
        <DashBoard />
      </SidebarLayout>
    ),
  },
  {
    path: '/clubs/:clubId/schedule',
    element: (
      <SidebarLayout sidebar={<ClubSideBar />}>
        <Schedule />
      </SidebarLayout>
    ),
  },
  {
    path: '/clubs/:clubId/members',
    element: (
      <SidebarLayout sidebar={<ClubSideBar />}>
        <ClubMembers />
      </SidebarLayout>
    ),
  },
  {
    path: 'clubs/:clubId/manage',
    element: (
      <SidebarLayout sidebar={<ClubSideBar />}>
        <ClubManagement />
      </SidebarLayout>
    ),
  },
  {
    path: '/community',
    element: (
      <MainLayout>
        <Community />
      </MainLayout>
    ),
  },
  {
    path: '/community/:tab',
    element: (
      <MainLayout>
        <CommunityDetail />
      </MainLayout>
    ),
  },
  {
    path: '/community/posts/:postId',
    element: (
      <MainLayout>
        <PostDetail />
      </MainLayout>
    ),
  },
  {
    path: 'community/write',
    element: (
      <MainLayout>
        <PostWrite />
      </MainLayout>
    ),
  },
  {
    path: '/gallery',
    element: (
      <MainLayout>
        <Gallery />
      </MainLayout>
    ),
  },
  {
    path: '/notice',
    element: (
      <SidebarLayout sidebar={<MyPageSidebar />}>
        <Notice />
      </SidebarLayout>
    ),
  },
  {
    path: '/mypage/profile',
    element: (
      <SidebarLayout sidebar={<MyPageSidebar />}>
        <MyPageProfile />
      </SidebarLayout>
    ),
  },
  {
    path: '/mypage/profile/edit',
    element: (
      <SidebarLayout sidebar={<MyPageSidebar />}>
        <ProfileEdit />
      </SidebarLayout>
    ),
  },
  {
    path: '/mypage/activities',
    element: (
      <SidebarLayout sidebar={<MyPageSidebar />}>
        <MyActivities />
      </SidebarLayout>
    ),
  },
  {
    path: '/mypage/password',
    element: (
      <SidebarLayout sidebar={<MyPageSidebar />}>
        <ChangePassword />
      </SidebarLayout>
    ),
  },
  {
    path: '/mypage/withdrawal',
    element: (
      <SidebarLayout sidebar={<MyPageSidebar />}>
        <AccountWithdrawal />
      </SidebarLayout>
    ),
  },

  // 동호회 새 상세 페이지 (목록에서 클릭시)
  {
    path: '/clubs/:clubId/detail',
    element: (
      <MainLayout>
        <ClubDetailNew />
      </MainLayout>
    ),
  },
  {
    path: '/clubs/:clubId',
    element: (
      <MainLayout>
        <ClubProfile />
      </MainLayout>
    ),
  },
  {
    path: '/clubs/:clubId/notice',
    element: <Notice />,
  },
  {
    path: '/clubs/:clubId/notice/:noticeId',
    element: <NoticeDetail />,
  },
  {
    path: '/clubs/:clubId/notice/write',
    element: <NoticeWrite />,
  },
  {
    path: '/clubs/:clubId/notice/edit/:postId',
    element: <NoticeEdit />,
  },
]);

export default router;
