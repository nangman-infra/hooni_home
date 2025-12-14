export function BlogSection() {
  return (
    <section className="py-12 text-center">
      <h2 className="mb-4 text-2xl font-semibold">Blog</h2>
      <p className="mb-6 text-gray-600">
        개발 과정과 학습 내용을 정리하는 블로그입니다.
      </p>

      <a
        href="https://heishooni.tistory.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded border px-6 py-3 text-sm font-medium hover:bg-gray-50"
      >
        Hooni's 티스토리 개발 블로그 방문하기 →
      </a>
    </section>
  );
}
