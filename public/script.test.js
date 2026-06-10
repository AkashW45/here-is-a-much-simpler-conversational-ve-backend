const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe('Generate random text button', () => {
  let generateBtn, loadingDiv, downloadBtn;

  beforeAll(() => {
    // Set up the DOM that the script expects
    document.body.innerHTML = `
      <button id="generateBtn">Generate</button>
      <div id="loading" class="hidden">Loading...</div>
      <a id="downloadBtn" class="hidden">Download</a>
    `;

    // Global mocks needed by the script
    global.fetch = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'blob:fake-url');
    window.alert = jest.fn();

    // Load the script (it attaches the DOMContentLoaded listener)
    require('./script.js');

    // Dispatch DOMContentLoaded so the listener fires and binds the click handler
    document.dispatchEvent(new Event('DOMContentLoaded'));

    generateBtn = document.getElementById('generateBtn');
    loadingDiv = document.getElementById('loading');
    downloadBtn = document.getElementById('downloadBtn');
  });

  beforeEach(() => {
    // Reset DOM state before each test
    loadingDiv.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    downloadBtn.href = '';
    generateBtn.disabled = false;

    jest.clearAllMocks();

    // Default fetch behaviour: success with a valid blob
    const fakeBlob = new Blob([new ArrayBuffer(10240)]);
    global.fetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(fakeBlob),
    });
  });

  test('should show loading and disable button, then on success show download link', async () => {
    // Act
    generateBtn.click();
    // The async handler hasn't resolved yet; we flush all pending promises
    await flushPromises();

    // Assert loading was removed and button re‑enabled (finally block)
    expect(loadingDiv.classList.contains('hidden')).toBe(true);
    expect(generateBtn.disabled).toBe(false);

    // Download link should be visible with correct href
    expect(downloadBtn.classList.contains('hidden')).toBe(false);
    expect(downloadBtn.href).toBe('blob:fake-url');

    expect(global.fetch).toHaveBeenCalledWith('/api/generate');
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('should handle fetch rejection and show alert', async () => {
    // Simulate network failure
    global.fetch.mockRejectedValue(new Error('Network error'));

    generateBtn.click();
    await flushPromises();

    expect(window.alert).toHaveBeenCalledWith(
      'Failed to generate text. Please try again.'
    );
    // Loading must be hidden and button enabled after error
    expect(loadingDiv.classList.contains('hidden')).toBe(true);
    expect(generateBtn.disabled).toBe(false);
    // Download link stays hidden
    expect(downloadBtn.classList.contains('hidden')).toBe(true);
  });

  test('should handle non‑ok response and show alert', async () => {
    // Response that is not ok (e.g. 500)
    global.fetch.mockResolvedValue({
      ok: false,
      blob: () => Promise.resolve(new Blob()),
    });

    generateBtn.click();
    await flushPromises();

    expect(window.alert).toHaveBeenCalledWith(
      'Failed to generate text. Please try again.'
    );
    expect(loadingDiv.classList.contains('hidden')).toBe(true);
    expect(generateBtn.disabled).toBe(false);
    expect(downloadBtn.classList.contains('hidden')).toBe(true);
  });

  test('should show loading indicator immediately after click', () => {
    // This test only checks the synchronous (pre‑fetch) UI update
    generateBtn.click();
    // Do NOT await any promises; the loader should be visible right now
    expect(loadingDiv.classList.contains('hidden')).toBe(false);
    expect(generateBtn.disabled).toBe(true);
  });
});