// src/pages/community/PostWrite.jsx - 무한 루프 수정
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { clubApi } from '../../services/api/clubApi';
import { postApi } from '../../services/api/postApi';

export default function PostWrite() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const objectUrlsRef = useRef([]);

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');

  // 가입한 동호회 목록 가져오기
  useEffect(() => {
    const fetchJoinedClubs = async () => {
      try {
        setLoading(true);
        const data = await clubApi.getJoinedClubs();
        console.log('가입한 동호회 목록:', data);

        if (data && Array.isArray(data)) {
          setClubs(data);

          if (data.length > 0) {
            setClub(data[0].clubId.toString());
          }
        } else {
          console.error('동호회 목록 데이터 형식 오류:', data);
          setClubs([]);
        }
      } catch (err) {
        console.error('동호회 목록 조회 실패:', err);
        console.error('에러 상세:', err.response || err.message);
        alert('동호회 목록을 불러오는데 실패했습니다.\n콘솔을 확인해주세요.');
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedClubs();
  }, []);

  // ✅ useMemo로 modules 메모이제이션 - 무한 루프 방지
  const modules = useRef({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: () => openFilePicker(),
      },
    },
    clipboard: { matchVisual: false },
  }).current;

  // ✅ formats도 useRef로 메모이제이션
  const formats = useRef([
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
  ]).current;

  // ✅ onChange 핸들러 수정 - content, delta, source, editor 모두 받기
  const handleEditorChange = (content, delta, source, editor) => {
    // source가 'user'일 때만 업데이트 (무한 루프 방지)
    if (source === 'user') {
      setHtml(content);
    }
  };

  useEffect(() => {
    const quill = editorRef.current?.getEditor();
    if (!quill) return;

    const onPaste = async (e) => {
      const items = e.clipboardData?.items || [];
      for (const it of items) {
        if (it.type?.startsWith('image/')) {
          e.preventDefault();
          const file = it.getAsFile();
          if (file) insertLocalPreview(file);
        }
      }
    };

    const onDrop = async (e) => {
      const files = e.dataTransfer?.files || [];
      if (files.length) {
        e.preventDefault();
        for (const f of files) if (f.type.startsWith('image/')) insertLocalPreview(f);
      }
    };

    quill.root.addEventListener('paste', onPaste);
    quill.root.addEventListener('drop', onDrop);
    return () => {
      quill.root.removeEventListener('paste', onPaste);
      quill.root.removeEventListener('drop', onDrop);
    };
  }, []); // ✅ 빈 의존성 배열

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => window.URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    };
  }, []);

  const openFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) insertLocalPreview(file);
    };
    input.click();
  };

  const insertLocalPreview = (file) => {
    const quill = editorRef.current?.getEditor();
    if (!quill) return;
    const url = window.URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'image', url, 'user');
    quill.setSelection(range.index + 1, 0);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return window.alert('제목을 입력해 주세요.');
    if (!html.trim()) return window.alert('내용을 입력해 주세요.');
    if (!club) return window.alert('동호회를 선택해 주세요.');

    try {
      const scope = visibility === 'PUBLIC' ? '전체' : '회원';

      const postData = {
        clubId: parseInt(club),
        title: title.trim(),
        content: html,
        images: null,
        postType: 'P',
        scope: scope,
      };

      console.log('게시글 등록 요청:', postData);

      await postApi.createPost(postData);

      alert('게시글이 등록되었습니다.');
      navigate('/community');
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert('게시글 등록에 실패했습니다.\n' + (error.message || '다시 시도해주세요.'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">동호회 목록을 불러오는 중...</div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center">
          <div className="text-gray-500 mb-4">가입한 동호회가 없습니다.</div>
          <div className="text-sm text-gray-400">
            게시글을 작성하려면 먼저 동호회에 가입해주세요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">글 쓰기</h1>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          등록
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          className="w-72 border border-gray-300 rounded px-3 py-2 outline-none"
        >
          {clubs.map((c) => (
            <option key={c.clubId} value={c.clubId}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="ml-auto border border-gray-200 rounded px-3 py-2">
          <div className="text-sm font-semibold text-gray-600 mb-1">공개 설정</div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="PUBLIC"
                checked={visibility === 'PUBLIC'}
                onChange={(e) => setVisibility(e.target.value)}
              />
              전체 공개
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="MEMBERS"
                checked={visibility === 'MEMBERS'}
                onChange={(e) => setVisibility(e.target.value)}
              />
              멤버 공개
            </label>
          </div>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력해 주세요"
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 outline-none"
      />

      <div className="border border-gray-200 rounded">
        {/* ✅ onChange에 handleEditorChange 사용 */}
        <ReactQuill
          ref={editorRef}
          theme="snow"
          value={html}
          onChange={handleEditorChange}
          modules={modules}
          formats={formats}
          placeholder="내용을 입력하세요."
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
}
