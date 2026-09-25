import { images } from "@/data/images";

export const imageOptions = Object.keys(images).map((k) => ({ value: k, label: k }));
