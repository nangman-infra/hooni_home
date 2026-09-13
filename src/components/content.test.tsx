import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container } from "@/components/container";
import { ProjectScene, projectCount } from "@/components/projects";
import { Topology } from "@/components/topology";

describe("hooni home content", () => {
  it("applies container layout classes", () => {
    render(<Container data-testid="container">content</Container>);

    expect(screen.getByTestId("container")).toHaveClass("wrap");
  });

  it("renders one project per scene", () => {
    expect(projectCount).toBe(5);
    render(<ProjectScene index={0} />);

    expect(screen.getByRole("heading", { name: /Nangman Hybrid Network/i })).toBeInTheDocument();
  });

  it("draws the five networks on the topology", () => {
    const { container } = render(<Topology />);

    expect(container.querySelectorAll(".site")).toHaveLength(5);
    expect(container.querySelectorAll(".node").length).toBeGreaterThan(20);
  });
});
