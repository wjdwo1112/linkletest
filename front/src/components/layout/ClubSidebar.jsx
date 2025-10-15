// // src/components/club/ClubSidebar.jsx
// import { useEffect, useRef, useState } from 'react';
// import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
// import { clubApi } from '../../services/api/clubApi';

// export default function ClubSidebar() {
//   const { clubId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [clubs, setClubs] = useState([]);
//   const [open, setOpen] = useState(false);
//   const wrapRef = useRef(null);

//   // 내 동호회 목록
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await clubApi.getJoinedClubs();
//         setClubs(data || []);
//         if ((!clubId || clubId === 'undefined') && data?.length) {
//           navigate(`/clubs/${data[0].clubId}/notice`, { replace: true });
//         }
//       } catch {
//         setClubs([]);
//       }
//     })();
//   }, [clubId, navigate]);

//   // 외부 클릭 시 드롭다운 닫기
//   useEffect(() => {
//     const onClick = (e) => {
//       if (!wrapRef.current) return;
//       if (!wrapRef.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener('click', onClick);
//     return () => document.removeEventListener('click', onClick);
//   }, []);

//   const current = clubs.find((c) => String(c.clubId) === String(clubId));

//   const goClub = (id, path = 'notice') => {
//     setOpen(false);
//     navigate(`/clubs/${id}/${path}`);
//   };

//   // 메뉴 (이미지 느낌: 얇은 분리선, 기본 연한 회색, hover 시 살짝)
//   const items = [
//     { label: '대시보드', path: `/clubs/${clubId}/dashboard` },
//     { label: '공지사항', path: `/clubs/${clubId}/notice` },
//     { label: '일정', path: `/clubs/${clubId}/schedule` },
//     { label: '멤버', path: `/clubs/${clubId}/members` },
//     { label: '채팅', path: `/clubs/${clubId}/chat` },
//   ];

//   const isActive = (p) => location.pathname.startsWith(p);

//   return (
//     <aside className="w-64">
//       <div ref={wrapRef} className="bg-white rounded-lg shadow-sm sticky top-24">
//         {/* 상단: 동호회명 + 케럿 */}
//         <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
//           <button
//             onClick={() => setOpen((v) => !v)}
//             className="flex items-center gap-1 text-[15px] font-semibold text-gray-900"
//             type="button"
//           >
//             {current ? current.name : '동호회'}
//             <span className="text-gray-500">▾</span>
//           </button>
//         </div>

//         {/* 드롭다운 (동호회 변경) */}
//         {open && (
//           <div className="absolute z-50 mt-1 ml-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg">
//             <ul className="max-h-72 overflow-y-auto py-1">
//               {(clubs || []).map((c) => (
//                 <li key={c.clubId}>
//                   <button
//                     onClick={() => goClub(c.clubId, 'notice')}
//                     className={`w-full text-left px-3 py-2 text-sm rounded-sm
//                       ${
//                         String(c.clubId) === String(clubId)
//                           ? 'bg-blue-50 text-blue-700'
//                           : 'text-gray-800 hover:bg-gray-50'
//                       }`}
//                   >
//                     {c.name}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* 메뉴 리스트 (얇은 구분선 스타일) */}
//         <nav className="py-1">
//           {items.map((m, i) => (
//             <Link
//               key={m.path}
//               to={m.path}
//               className={`block px-5 py-3 text-sm transition-colors
//                 ${
//                   isActive(m.path)
//                     ? 'text-gray-900 font-medium bg-gray-50'
//                     : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
//                 }`}
//             >
//               {m.label}
//               {i !== items.length - 1 && <div className="mt-3 border-t border-gray-100" />}
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </aside>
//   );
// }

import { Link, useLocation, useParams } from 'react-router-dom';

const ClubSidebar = ({ clubName }) => {
  const location = useLocation();
  const { clubId } = useParams();

  const menuItems = [
    {
      label: '대시보드',
      path: `/club/${clubId}/dashboard`,
      isActive: location.pathname === `/club/${clubId}/dashboard`,
    },
    {
      label: '공지사항',
      path: `/notice/${clubId}`,
      isActive: location.pathname === `/notice/${clubId}`,
    },
    {
      label: '일정',
      path: `/club/${clubId}/schedule`,
      isActive: location.pathname === `/club/${clubId}/schedule`,
    },
    {
      label: '앨범',
      path: `/club/${clubId}/album`,
      isActive: location.pathname === `/club/${clubId}/album`,
    },
    {
      label: '채팅',
      path: `/clubs/${clubId}/chat`,
      isActive: location.pathname === `/club/${clubId}/chat`,
    },
  ];

  return (
    <aside className="w-64">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{clubName || '동호회'}</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${item.isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-primary'}
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ClubSidebar;
