type StorageType = 'localStorage' | 'sessionStorage';

//! Change to NATIVE storage
function getSessionValue<T>(name: string, storage: StorageType = 'localStorage'): T | null {
  let item: string | null = null;
  if (storage === 'localStorage') {
    item = localStorage.getItem(name);
  } else {
    item = sessionStorage.getItem(name);
  }

  if (item) {
    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Parsing error in getSessionValue:', error);
      return null;
    }
  }
  return null;
}

function setSessionVal<T>(name: string, data: T, storage: StorageType = 'localStorage'): void {
  const serializedData = JSON.stringify(data);
  if (storage === 'localStorage') {
    localStorage.setItem(name, serializedData);
  } else {
    sessionStorage.setItem(name, serializedData);
  }
}

export {
    getSessionValue,
    setSessionVal
}