import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container } from "@/components/container";
import { Projects } from "@/components/projects";

describe("hooni home content", () => {
  it("applies container layout classes", () => {
    render(<Container data-testid="container">content</Container>);

    expect(screen.getByTestId("container")).toHaveClass("max-w-3xl");
  });

  it("renders project summary", () => {
    render(<Projects />);

    expect(screen.getByRole("heading", { name: /Nangman Hybrid Network/i })).toHaveTextContent(
      "Hybrid Cloud Network Architecture"
    );
  });
});
