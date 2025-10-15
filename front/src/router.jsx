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
import Community from '@pages/community/Community';
import CommunityDetail from './pages/community/CommunityDetail';
import PostDetail from './pages/community/PostDetail';
import PostWrite from './pages/community/PostWrite';
import Notice from './pages/notice/Notice';

const router = createBrowserRouter([
  // 메인 레이아웃
  {
    path: '/',
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
    ),
  },
  // 인증 레이아웃
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
  // 동호회별 공지사항 페이지
  {
    path: '/notice/:clubId',
    element: (
      <SidebarLayout sidebar={<MyPageSidebar />}>
        <Notice />
      </SidebarLayout>
    ),
  },
  // {
  //   path: '/clubs/:clubId/notice',
  //   element: (
  //     <MainLayout>
  //       <Notice />
  //     </MainLayout>
  //   ),
  // },
  // {
  //   path: '/clubs/:clubId/notice/write',
  //   element: (
  //     <SidebarLayout>
  //       <PostWrite />
  //     </SidebarLayout>
  //   ),
  // },
  // {
  //   path: '/clubs/:clubId/community',
  //   element: (
  //     <MainLayout>
  //       <Community />
  //     </MainLayout>
  //   ),
  // },
  // {
  //   path: '/clubs/:clubId/community/:tab',
  //   element: (
  //     <MainLayout>
  //       <CommunityDetail />
  //     </MainLayout>
  //   ),
  // },
  // {
  //   path: '/clubs/:clubId/community/posts/:postId',
  //   element: (
  //     <MainLayout>
  //       <PostDetail />
  //     </MainLayout>
  //   ),
  // },
]);

export default router;
