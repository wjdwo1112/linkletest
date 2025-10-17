import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { noticeApi } from '../../services/api/noticeApi';
import { fileApi } from '../../services/api/fileApi';
import useUserStore from '../../store/useUserStore';
import SidebarLayout from '../../components/layout/SidebarLayout';
import ClubSidebar from '../../components/layout/ClubSidebar';

export default function NoticeEdit() {
  const { clubId, postId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // { fileId, fileUrl, originalFileName }
  const [isPinned, setIsPinned] = useState('N');
  const [loading, setLoading] = useState(true);

  // 기존 공지사항 데이터 불러오기
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const notice = await noticeApi.getNoticeDetail(postId);

        setTitle(notice.title || '');
        setHtml(notice.content || '');
        setIsPinned(notice.isPinned || 'N');

        // 이미지가 있으면 fileId로 파일 정보 조회
        if (notice.images) {
          const fileIds = notice.images.split('/').map((id) => parseInt(id.trim()));

          // 각 fileId로 파일 정보 조회
          const fileInfos = await fileApi.getFiles(fileIds);
          setUploadedFiles(
            fileInfos.map((file) => ({
              fileId: file.fileId,
              fileUrl: file.fileLink,
              originalFileName: file.originalFileName,
            })),
          );
        }
      } catch (error) {
        console.error('공지사항 조회 실패:', error);
        alert('공지사항을 불러올 수 없습니다.');
        navigate(`/clubs/${clubId}/notice`);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchNotice();
    }
  }, [postId, clubId, navigate]);

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

    try {
      // fileId들을 '/'로 구분하여 문자열로 만듦
      const images = uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.fileId).join('/') : null;

      const noticeData = {
        title: title.trim(),
        content: html,
        images: images, // "1/2/3" 형태
        isPinned: isPinned,
      };

      console.log('공지사항 수정 요청:', noticeData);

      await noticeApi.updateNotice(postId, noticeData);

      alert('공지사항이 수정되었습니다.');
      navigate(`/clubs/${clubId}/notice/${postId}`);
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      alert('공지사항 수정에 실패했습니다.\n' + (error.message || '다시 시도해주세요.'));
    }
  };

  const handleCancel = () => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      navigate(`/clubs/${clubId}/notice/${postId}`);
    }
  };

  if (loading) {
    return (
      <SidebarLayout sidebar={<ClubSidebar />}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-gray-500 py-12">로딩 중...</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout sidebar={<ClubSidebar />}>
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">공지사항 수정</h1>
        </div>

        {/* 공지 고정 설정 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">공지 고정</label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isPinned"
                value="N"
                checked={isPinned === 'N'}
                onChange={(e) => setIsPinned(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">일반 공지</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isPinned"
                value="Y"
                checked={isPinned === 'Y'}
                onChange={(e) => setIsPinned(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">상단 고정</span>
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

        {/* 작성자 표시 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">작성자</label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-700">
            {user?.name || user?.nickname || '관리자'}
          </div>
        </div>

        {/* 내용 에디터 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
          <div className="border border-gray-300 rounded">
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

        {/* 업로드된 이미지 미리보기 */}
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

        {/* 하단 버튼 */}
        <div className="flex justify-center gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#4FA3FF] text-white rounded-lg text-sm font-medium hover:bg-[#4FA3FF]/90 transition-colors"
          >
            수정
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}
