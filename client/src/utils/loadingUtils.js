export const getRandomLoadingDuration = () => {
  return Math.floor(Math.random() * (3000 - 500 + 1) + 500); // Random between 500ms and 3000ms
};
