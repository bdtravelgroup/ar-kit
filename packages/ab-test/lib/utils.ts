import crc32 from 'fbjs/lib/crc32';

export const displayActiveVariant = (store, variantsComponents) => {
  const { variants, activeVariant, experimentName } = store;

  // eslint-disable-next-line no-restricted-syntax
  for (const variant in variantsComponents) {
    if (variants.indexOf(variant) === -1)
      throw Error(`Variant ${variant} does not exist in experiment ${experimentName}.`);
  }

  return variantsComponents[activeVariant];
};

export const calculateActiveVariant = (store, userIdentifier) => {
  const { variants, weights, experimentName } = store;
  const storedVariantKey = `ABTEST-${experimentName}-${userIdentifier}`;
  const storedVariant = localStorage.getItem(storedVariantKey);

  if (storedVariant) return storedVariant;

  const weightSum = weights.reduce((a, b) => {
    return a + b;
  }, 0);

  let weightedIndex = userIdentifier
    ? Math.abs(crc32(userIdentifier) % weightSum)
    : Math.floor(Math.random() * weightSum);

  let selectedVariant = variants[variants.length - 1];

  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < weights.length; index++) {
    weightedIndex -= weights[index];
    if (weightedIndex < 0) {
      selectedVariant = variants[index];
      break;
    }
  }

  if (userIdentifier && !storedVariant) localStorage.setItem(storedVariantKey, selectedVariant);

  return selectedVariant;
};
