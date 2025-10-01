import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AuthLayout, MyPageLayout } from './components/layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuth2Callback from './pages/auth/OAuth2Callback';
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
  // OAuth2 콜백 처리 페이지 추가
  {
    path: '/auth/callback',
    element: <OAuth2Callback />,
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
    path: '/community/posts/:postId', // ✅ 상세 라우트 추가
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
      <MyPageLayout>
        <Notice />
      </MyPageLayout>
    ),
  },
]);

export default router;
