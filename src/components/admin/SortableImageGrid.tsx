"use client";

import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SortableImage = {
  id: string;
  url: string;
  alt: string | null;
};

export default function SortableImageGrid({
  images,
  onReorder,
  onRemove,
  objectFit = "cover",
}: {
  images: SortableImage[];
  onReorder: (images: SortableImage[]) => void;
  onRemove: (id: string) => void;
  /** "cover" 裁切填滿（預設）；"contain" 依原圖比例完整顯示，不裁切 */
  objectFit?: "cover" | "contain";
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(images, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-5 gap-2">
          {images.map((img) => (
            <SortableImageItem key={img.id} image={img} onRemove={onRemove} objectFit={objectFit} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableImageItem({
  image,
  onRemove,
  objectFit,
}: {
  image: SortableImage;
  onRemove: (id: string) => void;
  objectFit: "cover" | "contain";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative aspect-square touch-none cursor-grab overflow-hidden border border-line active:cursor-grabbing ${
        objectFit === "contain" ? "bg-paper" : "bg-surface"
      } ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <Image
        src={image.url}
        alt={image.alt || ""}
        fill
        className={`pointer-events-none ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
      />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
        className="absolute right-1 top-1 bg-ink/70 px-2 py-0.5 font-mono text-[10px] text-surface opacity-0 transition group-hover:opacity-100"
      >
        移除
      </button>
    </div>
  );
}
