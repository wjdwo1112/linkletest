import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout';
import AuthLayout from '@components/layout/AuthLayout';
// import ProfileLayout from '@components/layout/ProfileLayout';
import Home from '@pages/Home/Home';
import Login from '@pages/auth/Login'
import Community from '@pages/community/Community'
import CommunityDetail from './pages/community/CommunityDetail';
import PostDetail from './pages/community/PostDetail';
import PostWrite from './pages/community/PostWrite';
import MyPageLayout from './components/layout/MyPageLayout';
import Notice from './pages/notice/Notice';

const router = createBrowserRouter([
  // 메인 레이아웃 - 헤더/푸터 있는 일반 페이지들
  {
    path: '/',
    element: (
      <MainLayout>
        <Home />
      </MainLayout>
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
    element:(
      <MainLayout>
        <CommunityDetail />
      </MainLayout>
    )
  },
  {
    path: '/community/posts/:postId',    // ✅ 상세 라우트 추가
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
    )
  },
  
  {
    path: '/gallery',
    element: (
      <MainLayout>
        <div className="p-8 text-center">갤러리 페이지 (준비중)</div>
      </MainLayout>
    ),
  },

  // 인증 레이아웃 - 로그인/회원가입 (헤더/푸터 없음)
  {
    path: '/login',
    element: (
      <AuthLayout>
        <Login/>
      </AuthLayout>
    ),
  },

  {
    path: '/notice',
    element: (
      <MyPageLayout>
        <Notice />
      </MyPageLayout>
    )
  }
  

  // 나중에 실제 페이지들을 만들면 이런 식으로 추가
  // {
  //   path: '/login',
  //   element: (
  //     <AuthLayout>
  //       <Login />  // 실제 Login 컴포넌트를 만든 후 import해서 사용
  //     </AuthLayout>
  //   ),
  // },
]);

export default router;
