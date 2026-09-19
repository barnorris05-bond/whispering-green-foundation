/**
 * Local SVG artwork registry — hand-authored scenes stored in public/artwork.
 * Zero remote-image dependency; used by gallery seed content.
 * These are clearly-labelled illustration concepts, not photographs.
 */

/** Registry so seed data (and admin tooling) can reference an artwork by key.
 *  Keys are stable strings stored in the DB; files live at public/artwork/<key>.svg. */
export const GALLERY_ARTWORKS: Array<{
  key: string;
  title: string;
  caption: string;
  alt: string;
}> = [
  {
    key: "river-cleanup",
    title: "Bhabola creek clean-up",
    caption: "Volunteers cleared litter from the creek bank during the weekend drive.",
    alt: "Illustration of volunteers collecting litter bags along a green creek bank",
  },
  {
    key: "sorting-station",
    title: "Segregation in practice",
    caption: "Dry, wet and e-waste kept in separate streams before weighing.",
    alt: "Illustration of three labelled waste bins for dry, wet and e-waste",
  },
  {
    key: "plant-drive",
    title: "Sapling distribution drive",
    caption: "Saplings handed to residents alongside segregation guidance.",
    alt: "Illustration of young saplings planted in a row with watering cans",
  },
  {
    key: "plastic-press",
    title: "Plastic baling day",
    caption: "Clean, dry plastic pressed into bales for the authorised recycler.",
    alt: "Illustration of two large green plastic bales stacked in a facility",
  },
  {
    key: "collect-van",
    title: "Doorstep collection round",
    caption: "The collection van on its Vasai-West neighbourhood round.",
    alt: "Illustration of a small collection van loaded with crates on a road",
  },
  {
    key: "awareness-session",
    title: "Community awareness session",
    caption: "A short session on two-bin segregation at the community hall.",
    alt: "Illustration of residents seated before a board showing leaf diagrams",
  },
];
