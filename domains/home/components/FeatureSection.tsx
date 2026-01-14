import { MAX_CONTENT_WIDTH } from "@/constants/ui";

type Feature = {
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    title: "클라우드",
    description: "AWS, NAVER Cloud 환경에 대한 이해와 활용",
  },
  {
    title: "네트워크",
    description: "Cisco 기반 네트워크 장비 및 구조 이해",
  },
  {
    title: "백엔드",
    description: "Java, TypeScript 기반 서버 애플리케이션 개발",
  },
];

export function FeatureSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div
        className="mx-auto px-4"
        style={{ maxWidth: MAX_CONTENT_WIDTH }}
      >
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Features
        </h2>

        <ul className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="rounded border bg-white p-6 text-center"
            >
              <h3 className="mb-2 font-medium">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
