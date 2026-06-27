"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ALLERGENS, CATEGORIES, Allergen, Category } from "@/lib/allergens";
import { formatMoney } from "@/lib/format";
import { compressImage } from "@/lib/image";

export type EditableItem = {
  _id: Id<"items">;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  allergenNotes?: string;
  photoUrl: string | null;
};

export function ItemForm({
  item,
  onClose,
}: {
  item?: EditableItem;
  onClose: () => void;
}) {
  const create = useMutation(api.items.create);
  const update = useMutation(api.items.update);
  const generateUploadUrl = useMutation(api.items.generateUploadUrl);
  const setPhoto = useMutation(api.items.setPhoto);

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [category, setCategory] = useState<Category>(
    (item?.category as Category) ?? "baked-good",
  );
  const [ingredients, setIngredients] = useState(
    item?.ingredients.join("\n") ?? "",
  );
  const [allergens, setAllergens] = useState<Allergen[]>(
    (item?.allergens as Allergen[]) ?? [],
  );
  const [allergenNotes, setAllergenNotes] = useState(item?.allergenNotes ?? "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    item?.photoUrl ?? null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  }

  function toggleAllergen(a: Allergen) {
    setAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = parseFloat(price);
    if (!name.trim()) return setError("Please give the item a name.");
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return setError("Please enter a valid price.");

    setBusy(true);
    try {
      const ingredientList = ingredients
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const fields = {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        ingredients: ingredientList,
        allergens,
        allergenNotes: allergenNotes.trim() || undefined,
      };

      let itemId: Id<"items">;
      if (item) {
        await update({ itemId: item._id, ...fields });
        itemId = item._id;
      } else {
        itemId = await create(fields);
      }

      // Upload a newly chosen photo (compress first; 3-step Convex flow).
      if (photoFile) {
        let body: Blob = photoFile;
        let type = photoFile.type;
        try {
          const out = await compressImage(photoFile);
          body = out.blob;
          type = out.type;
        } catch {
          // If compression fails, upload the original.
        }
        const postUrl = await generateUploadUrl();
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": type },
          body,
        });
        const { storageId } = await res.json();
        await setPhoto({ itemId, storageId });
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white p-5 shadow-lg"
    >
      <h2 className="text-2xl text-watermelon">
        {item ? "Edit item" : "New item"}
      </h2>

      <label className="block">
        <span className="font-bold text-cocoa">Name *</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input mt-1"
          placeholder="e.g. Strawberry Lemonade"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex-1">
          <span className="font-bold text-cocoa">Price *</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            className="input mt-1"
            placeholder="2.50"
          />
        </label>
        <label className="flex-1">
          <span className="font-bold text-cocoa">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="input mt-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="font-bold text-cocoa">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="input mt-1 resize-none"
          placeholder="Short, tasty description"
        />
      </label>

      <label className="block">
        <span className="font-bold text-cocoa">Ingredients</span>
        <span className="ml-2 text-sm text-cocoa/50">one per line</span>
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          rows={4}
          className="input mt-1 resize-none font-mono text-sm"
          placeholder={"Flour\nButter\nSugar\nChocolate chips"}
        />
      </label>

      <div>
        <span className="font-bold text-cocoa">Allergens</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALLERGENS.map((a) => {
            const on = allergens.includes(a.value);
            return (
              <button
                type="button"
                key={a.value}
                onClick={() => toggleAllergen(a.value)}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
                  on
                    ? "border-amber-400 bg-amber-100 text-amber-800"
                    : "border-cocoa/15 bg-white text-cocoa/50"
                }`}
              >
                {a.emoji} {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="font-bold text-cocoa">Allergen notes</span>
        <input
          value={allergenNotes}
          onChange={(e) => setAllergenNotes(e.target.value)}
          className="input mt-1"
          placeholder="e.g. May contain traces of nuts"
        />
      </label>

      <div>
        <span className="font-bold text-cocoa">Photo</span>
        <div className="mt-1 flex items-center gap-3">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt=""
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-cream text-2xl">
              📷
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="rounded-full bg-blueberry px-4 py-2 text-sm font-bold text-white shadow-md"
            >
              📷 Take photo
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="rounded-full border-2 border-cocoa/15 px-4 py-2 text-sm font-bold text-cocoa"
            >
              🖼️ Choose photo
            </button>
          </div>
          {/* Camera capture (mobile) */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPickPhoto}
            className="hidden"
          />
          {/* Pick from gallery / files */}
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            onChange={onPickPhoto}
            className="hidden"
          />
        </div>
        <p className="mt-1 text-xs text-cocoa/50">
          Photos are shrunk automatically before saving.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl bg-watermelon/10 px-3 py-2 text-center text-sm font-semibold text-watermelon">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-full bg-watermelon px-6 py-3 font-display font-extrabold text-white shadow-md disabled:opacity-50"
        >
          {busy ? "Saving…" : item ? "Save changes" : `Add item (${formatMoney(parseFloat(price) || 0)})`}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border-2 border-cocoa/15 px-5 py-3 font-bold text-cocoa"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
