export const useAutoNumberInput = () => {
  const handleInputChange = (rawValue:string, currentValue:string, setValue: (value: string) => void) => {

    if (rawValue === '') {
      setValue('');
      return;
    }

    // Normalisasi koma ke titik untuk pengecekan validasi
    let normalizedValue = rawValue.replace(',', '.');

    // Jika nilai saat ini '0' dan user mengetik angka 1-9, timpa '0' dengan angka tersebut
    if (currentValue === '0' && /^[1-9]$/.test(rawValue)) {
      setValue(rawValue);
      return;
    }

    // Regex validasi: angka bulat tanpa 0 di depan, atau angka desimal
    const regex = /^(0|[1-9]\d*)?(\.\d*)?$/;

    if (normalizedValue.length > 1 && normalizedValue[0] === '0' && normalizedValue[1] !== '.') {
      // Buang karakter '0' di index pertama
      rawValue = rawValue.slice(1);
      normalizedValue = normalizedValue.slice(1);
    }

    // Jika lolos regex, update nilai
    if (regex.test(normalizedValue)) {
      setValue(rawValue);
    }
  };

  return { handleInputChange };
};