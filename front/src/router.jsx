import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AuthLayout, SidebarLayout } from './components/layout';
import MyPageSidebar from './components/layout/MyPageSidebar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterStep2 from './pages/auth/RegisterStep2';
import RegisterStep3 from './pages/auth/RegisterStep3';
import OAuth2Callback from './pages/auth/OAuth2Callback';
import FindId from './pages/auth/FindId';
import VerifyEmail from './pages/auth/VerifyEmail';
import RegisterComplete from './pages/auth/RegisterComplete';
import FindPassword from './pages/auth/FindPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Community from '@pages/community/Community';
import CommunityDetail from './pages/community/CommunityDetail';
import PostDetail from './pages/community/PostDetail';
import PostWrite from './pages/community/PostWrite';
import Notice from './pages/notice/Notice';
import MyPageProfile from './pages/mypage/MyPageProfile';
import ProfileEdit from './pages/mypage/ProfileEdit';
import ChangePassword from './pages/mypage/ChangePassword';
import AccountWithdrawal from './pages/mypage/AccountWithdrawal';
import NoticeDetail from './pages/notice/NoticeDetail';
import NoticeWrite from './pages/notice/NoticeWrite';
import NoticeEdit from './pages/notice/NoticeEdit';
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
    path: '/reset-password',
    element: (
      <AuthLayout>
        <ResetPassword />
      </AuthLayout>
    ),
  },
  // OAuth2 콜백 처리 페이지
  {
    path: '/auth/callback',
    element: <OAuth2Callback />,
  },
  {
    path: '/auth/verify-email',
    element: <VerifyEmail />,
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
