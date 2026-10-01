"use client";

import { ChangeEvent, DragEvent, ReactNode, useRef, useState } from "react";
import Link from "next/link";
import type { HeroSlideSettings, HomeCategoryImageKey, HomeImageSettings } from "../../lib/home-images";

type ImageEditorProps = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
};

const categoryLabels: Array<{ key: HomeCategoryImageKey; title: string }> = [
  { key: "cosplays", title: "Cosplays" },
  { key: "pelucas", title: "Pelucas" },
  { key: "lentes", title: "Lentes" },
  { key: "accesorios", title: "Accesorios" },
  { key: "preventa", title: "Preventa" },
  { key: "alquiler", title: "Alquiler" },
];

function ImageEditor({ id, title, subtitle, value, onChange, children }: ImageEditorProps) {
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
        {value ? <img src={value} alt={title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm font-bold text-[var(--text-muted)]">Sin imagen</div>}
      </div>
      <div className="p-4">
        <h2 className="font-extrabold text-[var(--text)]">{title}</h2>
        <p className="mt-1 text-xs font-medium text-[var(--text-soft)]">{subtitle}</p>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://..." className="mt-4 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm font-medium outline-none focus:border-[var(--primary)]" />
        <input ref={inputRef} id={id} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} disabled={uploading} className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-cyan-400 bg-cyan-50 px-3 text-sm font-extrabold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-wait disabled:opacity-70">
          {uploading ? "Subiendo imagen..." : "Subir o arrastrar imagen"}
        </button>
        {children}
        {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
      </div>
    </article>
  );
}

export default function ImageSettingsClient({ initialSettings }: { initialSettings: HomeImageSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateSlide(index: number, field: keyof HeroSlideSettings, value: string) {
    setSettings((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((slide, slideIndex) => slideIndex === index ? { ...slide, [field]: value } : slide),
    }));
  }

  function addSlide() {
    setSettings((current) => current.heroSlides.length >= 8 ? current : ({
      ...current,
      heroSlides: [...current.heroSlides, { image: current.heroSlides.at(-1)?.image || "", tag: "Nueva categoría", title: "Nuevo slide", href: "/productos" }],
    }));
  }

  function removeSlide(index: number) {
    setSettings((current) => current.heroSlides.length <= 1 ? current : ({
      ...current,
      heroSlides: current.heroSlides.filter((_, slideIndex) => slideIndex !== index),
    }));
  }

  function setCategoryImage(key: HomeCategoryImageKey, image: string) {
    setSettings((current) => ({ ...current, categoryImages: { ...current.categoryImages, [key]: image } }));
  }

  function setCategoryHeroImage(key: HomeCategoryImageKey, image: string) {
    setSettings((current) => ({ ...current, categoryHeroImages: { ...current.categoryHeroImages, [key]: image } }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/configuracion-imagenes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudieron guardar los cambios.");
      setSettings(data.settings);
      setMessage("Imágenes guardadas. Actualiza la página principal o la categoría para verlas.");
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-6 text-[var(--text)] sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <datalist id="destinos-disponibles">
          <option value="/productos" />
          <option value="/categoria/cosplays" />
          <option value="/categoria/pelucas" />
          <option value="/categoria/lentes" />
          <option value="/categoria/accesorios" />
          <option value="/categoria/preventa" />
          <option value="/categoria/alquiler" />
          <option value="/buscar?q=cosplays" />
          <option value="/buscar?q=lentes" />
        </datalist>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-[var(--surface)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)] shadow-sm">Página principal y categorías</span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Configuración de imágenes</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-[var(--text-soft)] sm:text-base">Sube una imagen, reutiliza una URL o pega otra. Cada slide puede tener su nombre y destino; cada categoría tiene imagen de tarjeta y banner propio.</p>
          </div>
          <Link href="/admin" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-extrabold">← Panel admin</Link>
        </div>

        <section className="rounded-[30px] border border-[var(--border)] bg-white p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-2xl font-extrabold">Carrusel principal</h2><p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">Configura la imagen, el texto que se ve encima y dónde abre al pulsarla.</p></div>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={addSlide} disabled={settings.heroSlides.length >= 8} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-extrabold disabled:opacity-50">+ Añadir slide</button><button type="button" onClick={save} disabled={saving} className="rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--primary-dark)] disabled:opacity-70">{saving ? "Guardando..." : "Guardar cambios"}</button></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {settings.heroSlides.map((slide, index) => <ImageEditor key={index} id={`hero-${index}`} title={`Slide ${index + 1}`} subtitle="Carrusel de inicio" value={slide.image} onChange={(image) => updateSlide(index, "image", image)}><div className="mt-3 grid gap-2"><input value={slide.tag} onChange={(event) => updateSlide(index, "tag", event.target.value)} placeholder="Etiqueta: Cosplay" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm font-semibold" /><input value={slide.title} onChange={(event) => updateSlide(index, "title", event.target.value)} placeholder="Título visible" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm font-semibold" /><input list="destinos-disponibles" value={slide.href} onChange={(event) => updateSlide(index, "href", event.target.value)} placeholder="Elige o escribe un destino" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm font-semibold" /><button type="button" onClick={() => removeSlide(index)} disabled={settings.heroSlides.length <= 1} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-extrabold text-red-600 disabled:opacity-40">Quitar slide</button></div></ImageEditor>)}
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-[var(--border)] bg-white p-4 shadow-[0_10px_30px_var(--shadow)] sm:p-6">
          <h2 className="text-2xl font-extrabold">Imágenes por categoría</h2>
          <p className="mt-1 text-sm font-semibold text-[var(--text-soft)]">La primera se usa en la tarjeta de inicio; la segunda es el banner grande de esa misma categoría. Puedes usar la misma imagen o una diferente.</p>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {categoryLabels.map((category) => <div key={category.key} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] p-3 sm:p-4"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-extrabold">{category.title}</h3><button type="button" onClick={() => setCategoryHeroImage(category.key, settings.categoryImages[category.key])} className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-extrabold text-[var(--primary)]">Usar imagen de tarjeta en banner</button></div><div className="grid gap-3 sm:grid-cols-2"><ImageEditor id={`category-card-${category.key}`} title="Tarjeta principal" subtitle="Inicio, debajo del carrusel" value={settings.categoryImages[category.key]} onChange={(image) => setCategoryImage(category.key, image)} /><ImageEditor id={`category-banner-${category.key}`} title="Banner de categoría" subtitle={`Encabezado de ${category.title}`} value={settings.categoryHeroImages[category.key]} onChange={(image) => setCategoryHeroImage(category.key, image)} /></div></div>)}
          </div>
        </section>

        {message && <p className={`mt-5 rounded-2xl px-4 py-3 text-sm font-bold ${message.startsWith("Imágenes guardadas") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message}</p>}
      </div>
    </main>
  );
}
