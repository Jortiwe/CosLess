"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import Link from "next/link";
import type { HomeCategoryImageKey, HomeImageSettings } from "../../lib/home-images";

type ImageField = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
};

const categoryLabels: Array<{ key: HomeCategoryImageKey; title: string }> = [
  { key: "cosplays", title: "Cosplays" },
  { key: "pelucas", title: "Pelucas" },
  { key: "lentes", title: "Lentes" },
  { key: "accesorios", title: "Accesorios" },
  { key: "preventa", title: "Preventa" },
  { key: "alquiler", title: "Alquiler" },
];

function ImageEditor({ id, title, subtitle, value, onChange }: ImageField) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scope", "site");
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "No se pudo subir la imagen.");
      onChange(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    void upload(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    void upload(event.dataTransfer.files?.[0]);
  }

  return (
    <article className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="relative aspect-[16/8] overflow-hidden bg-[var(--surface-soft)]">
        {value ? (
          <img src={value} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-[var(--text-muted)]">Sin imagen</div>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-extrabold text-[var(--text)]">{title}</h2>
        <p className="mt-1 text-xs font-medium text-[var(--text-soft)]">{subtitle}</p>

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className="mt-4 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm font-medium outline-none focus:border-[var(--primary)]"
        />

        <input ref={inputRef} id={id} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          disabled={uploading}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-cyan-400 bg-cyan-50 px-3 text-sm font-extrabold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-wait disabled:opacity-70"
        >
          {uploading ? "Subiendo imagen..." : "Subir o arrastrar imagen"}
        </button>
        {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
      </div>
    </article>
  );
}

export default function ImageSettingsClient({ initialSettings }: { initialSettings: HomeImageSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function setHeroImage(index: number, image: string) {
    setSettings((current) => ({
      ...current,
      heroImages: current.heroImages.map((currentImage, currentIndex) =>
        currentIndex === index ? image : currentImage
      ),
    }));
  }

  function setCategoryImage(key: HomeCategoryImageKey, image: string) {
    setSettings((current) => ({
      ...current,
      categoryImages: { ...current.categoryImages, [key]: image },
    }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/configuracion-imagenes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudieron guardar los cambios.");
      setSettings(data.settings);
      setMessage("Imágenes guardadas. Actualiza la página principal para verlas.");
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)] shadow-sm">Página principal</span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Configuración de imágenes</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-[var(--text-soft)] sm:text-base">Cambia las imágenes del carrusel y de las tarjetas de categorías. Puedes pegar una URL o subir un archivo.</p>
          </div>
          <Link href="/admin" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-extrabold">← Panel admin</Link>
        </div>

        <section className="rounded-[30px] border border-[var(--border)] bg-white p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-2xl font-extrabold">Carrusel principal</h2><p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">Cuatro imágenes que rotan en la parte superior.</p></div>
            <button type="button" onClick={save} disabled={saving} className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)] disabled:opacity-70">{saving ? "Guardando..." : "Guardar cambios"}</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {settings.heroImages.map((image, index) => <ImageEditor key={index} id={`hero-${index}`} title={`Imagen ${index + 1}`} subtitle="Carrusel principal" value={image} onChange={(nextImage) => setHeroImage(index, nextImage)} />)}
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-[var(--border)] bg-white p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-6">
          <h2 className="text-2xl font-extrabold">Categorías</h2>
          <p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">Imágenes de las seis tarjetas que aparecen debajo del carrusel.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categoryLabels.map((category) => <ImageEditor key={category.key} id={`category-${category.key}`} title={category.title} subtitle="Tarjeta de categoría" value={settings.categoryImages[category.key]} onChange={(nextImage) => setCategoryImage(category.key, nextImage)} />)}
          </div>
        </section>

        {message && <p className={`mt-5 rounded-2xl px-4 py-3 text-sm font-bold ${message.startsWith("Imágenes guardadas") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message}</p>}
      </div>
    </main>
  );
}
