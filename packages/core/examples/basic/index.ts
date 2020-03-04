function effects() {
  const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll('input.form-control');
  inputs.forEach(ele => {
    ele.addEventListener('input', e => {
      console.log((e.target as HTMLInputElement).value);
    });
    ele.addEventListener('focus', () => {
      console.log('focus');
    });
    ele.addEventListener('blur', () => {
      console.log('blur');
    });
  });

  const fieldNameInput = document.querySelector('input[name=fieldName]') as HTMLInputElement;

  const primaryButton = document.getElementById('primary-btn');
  primaryButton.addEventListener('click', () => {
    fieldNameInput.value = 'daddy';
  });

  const secondaryButton = document.getElementById('reset-btn');
  secondaryButton.addEventListener('click', () => {
    fieldNameInput.value = '';
  });
}

window.onload = effects;
