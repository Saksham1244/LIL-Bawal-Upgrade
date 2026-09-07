import { useState } from "react";

export default function SidebarLinkGroup({ activecondition, children }) {
  const [open, setOpen] = useState(activecondition);
  return (
    <li className={`rounded-lg mb-0.5 last:mb-0 ${activecondition && "bg-indigo-600/10"}`}>
      {children(setOpen, open)}
    </li>
  );
}
