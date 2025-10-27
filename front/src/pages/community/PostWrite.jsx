// src/pages/community/PostWrite.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { clubApi } from '../../services/api/clubApi';
import { postApi } from '../../services/api/postApi';
import { fileApi } from '../../services/api/fileApi';
import ConfirmModal from '../../components/common/ConfirmModal';
import AlertModal from '../../components/common/AlertModal';

export default function PostWrite() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [searchParams] = useSearchParams();
  const editPostId = searchParams.get('edit'); // 수정 모드인지 확인

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState('');
  const [visibility, setVisibility] = useState('ALL');
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // { fileId, fileUrl, originalFileName }
  const [isEditMode, setIsEditMode] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onCloseCallback: null,
  });

  // 수정 모드일 때 기존 게시글 데이터 불러오기
  useEffect(() => {
    const fetchPostData = async () => {
      if (!editPostId) return;

      try {
        setLoading(true);
        const postData = await postApi.getPostDetail(editPostId);

        // 기존 데이터로 상태 설정
        setTitle(postData.title);
        setHtml(postData.content);
        setClub(postData.clubId.toString());
        setVisibility(postData.scope);
        setIsEditMode(true);

        // 기존 이미지가 있다면 uploadedFiles에 설정
        if (postData.images) {
          const fileIds = postData.images.split('/').map((id) => parseInt(id.trim()));

          // fileApi.getFiles()로 실제 파일 정보 가져오기
          const fileInfos = await fileApi.getFiles(fileIds);
          setUploadedFiles(
            fileInfos.map((file) => ({
              fileId: file.fileId,
              fileUrl: file.fileLink, // ✅ 실제 URL
              originalFileName: file.originalFileName,
            })),
          );
        }

        setLoading(false);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        setAlertModal({
          isOpen: true,
          title: '오류',
          message: '게시글을 불러오는데 실패했습니다.',
        });
        setTimeout(() => {
          navigate('/community');
        }, 1000);
      }
    };

    fetchPostData();
  }, [editPostId, navigate]);

  // 가입한 동호회 목록 불러오기
  useEffect(() => {
    const fetchJoinedClubs = async () => {
      try {
        setLoading(true);
        const data = await clubApi.getJoinedClubs();
        console.log('가입한 동호회 목록:', data);

        if (data && Array.isArray(data)) {
          setClubs(data);

          // 수정 모드가 아니고 동호회가 있으면 첫 번째 동호회 선택
          if (!editPostId && data.length > 0) {
            setClub(data[0].clubId.toString());
          }
        } else {
          console.error('동호회 목록 데이터 형식 오류:', data);
          setClubs([]);
        }
      } catch (err) {
        console.error('동호회 목록 조회 실패:', err);
        console.error('에러 상세:', err.response || err.message);
        setAlertModal({
          isOpen: true,
          title: '오류',
          message: '동호회 목록을 불러오는데 실패했습니다.',
        });
        setClubs([]);
      } finally {
        if (!editPostId) {
          setLoading(false);
        }
      }
    };

    fetchJoinedClubs();
  }, [editPostId]);

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
          setAlertModal({
            isOpen: true,
            title: '오류',
            message: '이미지 업로드에 실패했습니다.',
          });
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
    if (!title.trim()) {
      setAlertModal({
        isOpen: true,
        title: '입력 오류',
        message: '제목을 입력해 주세요.',
      });
      return;
    }
    if (!html.trim()) {
      setAlertModal({
        isOpen: true,
        title: '입력 오류',
        message: '내용을 입력해 주세요.',
      });
      return;
    }
    if (!club) {
      setAlertModal({
        isOpen: true,
        title: '입력 오류',
        message: '동호회를 선택해 주세요.',
      });
      return;
    }

    try {
      const scope = visibility;

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

      console.log(isEditMode ? '게시글 수정 요청:' : '게시글 등록 요청:', postData);

      if (isEditMode) {
        // 수정 모드
        await postApi.updatePost(editPostId, postData);
        setAlertModal({
          isOpen: true,
          title: '수정 완료',
          message: '게시글이 수정되었습니다.',
          onCloseCallback: () => {
            navigate(`/community/posts/${editPostId}`);
          },
        });
      } else {
        await postApi.createPost(postData);
        setAlertModal({
          isOpen: true,
          title: '등록 완료',
          message: '게시글이 등록되었습니다.',
          onCloseCallback: () => {
            navigate(`/community`);
          },
        });
      }
    } catch (error) {
      console.error(isEditMode ? '게시글 수정 실패:' : '게시글 등록 실패:', error);
      setAlertModal({
        isOpen: true,
        title: '오류',
        message: isEditMode
          ? '게시글 수정에 실패했습니다.\n' + (error.message || '다시 시도해주세요.')
          : '게시글 등록에 실패했습니다.\n' + (error.message || '다시 시도해주세요.'),
      });
    }
  };

  const handleCancel = () => {
    setConfirmModal({
      isOpen: true,
      title: '취소 확인',
      message: isEditMode ? '수정을 취소하시겠습니까?' : '작성을 취소하시겠습니까?',
      onConfirm: () => {
        if (isEditMode) {
          navigate(`/community/posts/${editPostId}`);
        } else {
          navigate('/community');
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (clubs.length === 0 && !isEditMode) {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? '게시글 수정' : '게시글 작성'}
        </h1>
      </div>

      {/* 동호회 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">동호회 선택</label>
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          disabled={isEditMode} // 수정 모드에서는 동호회 변경 불가
          className="w-1/ border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">동호회를 선택하세요</option>
          {clubs.map((c) => (
            <option key={c.clubId} value={c.clubId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 공개 범위 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">공개 범위</label>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="ALL"
              checked={visibility === 'ALL'}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">전체 공개</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              value="MEMBER"
              checked={visibility === 'MEMBER'}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">멤버 공개</span>
          </label>
        </div>
      </div>

      {/* 제목 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해 주세요"
          className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>

      {/* 내용 에디터 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
        <div className="border border-gray-300 rounded">
          <style>{`
      .notice-editor-wrapper .ql-container {
        height: 458px !important;
      }
      .notice-editor-wrapper .ql-editor {
        min-height: 100%;
      }
    `}</style>
          <div className="notice-editor-wrapper">
            <ReactQuill
              ref={editorRef}
              theme="snow"
              value={html}
              onChange={handleEditorChange}
              modules={modules}
              formats={formats}
              placeholder="내용을 입력하세요."
            />
          </div>
        </div>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="border border-gray-200 rounded p-4 mb-4">
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
      {/* 버튼 영역 */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-[#4CA8FF] text-white rounded hover:bg-[#3A8FE6]"
        >
          {isEditMode ? '수정' : '등록'}
        </button>
      </div>

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="확인"
        cancelText="취소"
        confirmButtonStyle="primary"
      />

      {/* AlertModal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          setAlertModal({ ...alertModal, isOpen: false });
          // 특정 경우에만 navigate 실행
          if (alertModal.onCloseCallback) {
            alertModal.onCloseCallback();
          }
        }}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
}
