export const FOOTER_ASSETS = {
  ALVILLAS: "https://rtltc5wyywy1ypik.public.blob.vercel-storage.com/Footer/logo_alvillas.png",
  JUASMO: "https://rtltc5wyywy1ypik.public.blob.vercel-storage.com/Footer/logo_juasmo.png",
  UYIMERO: "https://rtltc5wyywy1ypik.public.blob.vercel-storage.com/Footer/logo_uyimero.png",
  WALLPAPER: "https://rtltc5wyywy1ypik.public.blob.vercel-storage.com/Footer/wallpaper_season1.webp",
};

export const EPIC_ROOM_ASSETS = {
  EMPTY_ROOM: "https://rtltc5wyywy1ypik.public.blob.vercel-storage.com/Images/empty-room.jpg",
  DRIVER: "https://rtltc5wyywy1ypik.public.blob.vercel-storage.com/Images/driver-min.png",
};

export const TEXTURE_ASSETS = {
  CARBON_FIBRE: "https://www.transparenttextures.com/patterns/carbon-fibre.png",
  STARDUST: "https://www.transparenttextures.com/patterns/stardust.png",
  CUBES: "https://www.transparenttextures.com/patterns/cubes.png",
};

export const getFlagUrl = (flagCode: string, width: number | string = 40) => {
  if (width === '24x18') return `https://flagcdn.com/24x18/${flagCode}.png`;
  return `https://flagcdn.com/w${width}/${flagCode}.png`;
};

export const getPlaceholderImage = (seed: string, width: number, height: number) => {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

export const getAvatarFallbackUrl = (seed: string) => {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=slate800`;
};
