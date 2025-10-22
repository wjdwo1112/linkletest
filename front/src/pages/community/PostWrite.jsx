// src/pages/community/PostWrite.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { clubApi } from '../../services/api/clubApi';
import { postApi } from '../../services/api/postApi';
import { fileApi } from '../../services/api/fileApi';

export default function PostWrite() {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // { fileId, fileUrl, originalFileName }

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

  // 이미지 핸들러 - S3 업로드 후 DB에 저장하고 fileId 받기
  const handleImageClick = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'true');
    input.onchange = async () => {
      const files = Array.from(input.files || []);

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        try {
          // fileApi.uploadImage()는 { fileId, fileUrl, originalFileName } 반환
          const uploadResponse = await fileApi.uploadImage(file);
          setUploadedFiles((prev) => [...prev, uploadResponse]);
          console.log('이미지 업로드 성공:', uploadResponse);
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
    input.click();
  };

  // 이미지 버튼 포함된 toolbar
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
        image: handleImageClick,
      },
    },
    clipboard: { matchVisual: false },
  }).current;

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
  ]).current;

  const handleEditorChange = (content, delta, source) => {
    if (source === 'user') {
      setHtml(content);
    }
  };

  // 이미지 삭제
  const handleImageRemove = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return window.alert('제목을 입력해 주세요.');
    if (!html.trim()) return window.alert('내용을 입력해 주세요.');
    if (!club) return window.alert('동호회를 선택해 주세요.');

    try {
      const scope = visibility === 'PUBLIC' ? 'ALL' : 'MEMBER';

      // fileId들을 '/'로 구분하여 문자열로 만듦
      const images = uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.fileId).join('/') : null;

      const postData = {
        clubId: parseInt(club),
        title: title.trim(),
        content: html,
        images: images, // "1/2/3" 형태
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

      <div className="border border-gray-200 rounded mb-4">
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

      {/* 업로드된 이미지 미리보기 */}
      {uploadedFiles.length > 0 && (
        <div className="border border-gray-200 rounded p-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">첨부된 이미지</div>
          <div className="grid grid-cols-4 gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={file.fileUrl}
                  alt={file.originalFileName || `첨부 ${index + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-200 bg-gray-100"
                />
                <button
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
