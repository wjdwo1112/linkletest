// src/pages/community/PostWrite.jsx
// 설치: npm i react-quill-new quill
import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';

export default function PostWrite() {
  const editorRef = useRef(null);
  const objectUrlsRef = useRef([]); // 미리보기 URL 정리용

  // 폼 상태
  const [club, setClub] = useState('동호회1');
  const [board] = useState('자유게시판');
  const [visibility, setVisibility] = useState('PUBLIC'); // PUBLIC / MEMBERS
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');

  // 툴바 설정
  const modules = {
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
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'blockquote',
    'code-block',
    'link',
    'image',
  ];

  // 붙여넣기/드래그 이미지 → 로컬 미리보기로 삽입
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
  }, []);

  // 미리보기 URL 정리
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => window.URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    };
  }, []);

  // 파일 선택
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

  // 로컬 미리보기 이미지 삽입 (업로드 없음)
  const insertLocalPreview = (file) => {
    const quill = editorRef.current?.getEditor();
    if (!quill) return;
    const url = window.URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'image', url, 'user');
    quill.setSelection(range.index + 1, 0);
  };

  // 등록(지금은 UI 데모만)
  const handleSubmit = async () => {
    if (!title.trim()) return window.alert('제목을 입력해 주세요.');
    if (!html.trim()) return window.alert('내용을 입력해 주세요.');

    console.log({
      club,
      board,
      visibility,
      title,
      htmlLength: html.length,
      // delta: editorRef.current?.getEditor().getContents(), // 필요 시 확인
    });
    window.alert('현재는 UI만 구성되어 있습니다. (백엔드 연동 전)');

    /* ▼▼▼ 추후 백엔드 연동 예시 (주석 유지) ▼▼▼
    import { api } from '@/lib/axios';

    // 1) presigned URL 받아 S3 업로드 → 공개 URL만 본문에 삽입
    // const { data } = await api.post('/uploads/presign', { fileName, fileType });
    // await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    // quill.insertEmbed(range.index, 'image', data.publicUrl);

    // 2) 본문 저장
    await api.post('/community/posts', {
      club,
      board,
      visibility,
      title,
      contentHtml: html,
      contentDelta: editorRef.current?.getEditor().getContents(),
    });
    */
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* 상단 타이틀 / 등록 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">글 쓰기</h1>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          등록
        </button>
      </div>

      {/* 상단 폼 라인 */}
      <div className="flex items-center gap-4 mb-4">
        {/* 동호회 선택 */}
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          className="w-72 border border-gray-300 rounded px-3 py-2 outline-none"
        >
          <option>동호회1</option>
          <option>동호회2</option>
          <option>동호회3</option>
        </select>

        {/* 공개 설정 (우측 작은 패널 느낌) */}
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

      {/* 제목 */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력해 주세요"
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 outline-none"
      />

      {/* 에디터 */}
      <div className="border border-gray-200 rounded">
        <ReactQuill
          ref={editorRef}
          theme="snow"
          value={html}
          onChange={setHtml}
          modules={modules}
          formats={formats}
          placeholder="내용을 입력하세요."
          style={{ height: 460 }}
        />
      </div>
    </div>
  );
}
