import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SocialShareButtons } from './SocialShareButtons';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
});

describe('SocialShareButtons', () => {
  const mockReferralLink = 'https://leaderacademy.school/referral/abc123';

  beforeEach(() => {
    mockOpen.mockClear();
    vi.clearAllMocks();
  });

  it('renders all social media buttons', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    expect(screen.getByTitle('نسخ الرابط')).toBeInTheDocument();
    expect(screen.getByTitle('مشاركة على واتس آب')).toBeInTheDocument();
    expect(screen.getByTitle('مشاركة على فيسبوك')).toBeInTheDocument();
    expect(screen.getByTitle('مشاركة على تويتر')).toBeInTheDocument();
    expect(screen.getByTitle('مشاركة على لينكد إن')).toBeInTheDocument();
  });

  it('renders info text', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    expect(screen.getByText(/شارك رابط الإحالة مع أصدقائك/)).toBeInTheDocument();
  });

  it('copies link to clipboard when copy button is clicked', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<SocialShareButtons referralLink={mockReferralLink} />);

    const copyButton = screen.getByTitle('نسخ الرابط');
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockReferralLink);
  });

  it('opens WhatsApp share with correct URL', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    const whatsappButton = screen.getByTitle('مشاركة على واتس آب');
    fireEvent.click(whatsappButton);

    expect(mockOpen).toHaveBeenCalled();
    const callArgs = mockOpen.mock.calls[0][0];
    expect(callArgs).toContain('wa.me');
    expect(callArgs).toContain(encodeURIComponent(mockReferralLink));
  });

  it('opens Facebook share with correct URL', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    const facebookButton = screen.getByTitle('مشاركة على فيسبوك');
    fireEvent.click(facebookButton);

    expect(mockOpen).toHaveBeenCalled();
    const callArgs = mockOpen.mock.calls[0][0];
    expect(callArgs).toContain('facebook.com/sharer');
  });

  it('opens Twitter share with correct URL', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    const twitterButton = screen.getByTitle('مشاركة على تويتر');
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalled();
    const callArgs = mockOpen.mock.calls[0][0];
    expect(callArgs).toContain('twitter.com/intent/tweet');
  });

  it('opens LinkedIn share with correct URL', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    const linkedinButton = screen.getByTitle('مشاركة على لينكد إن');
    fireEvent.click(linkedinButton);

    expect(mockOpen).toHaveBeenCalled();
    const callArgs = mockOpen.mock.calls[0][0];
    expect(callArgs).toContain('linkedin.com/sharing');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SocialShareButtons 
        referralLink={mockReferralLink} 
        className="custom-class"
      />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('uses custom teacher name if provided', () => {
    render(
      <SocialShareButtons 
        referralLink={mockReferralLink}
        teacherName="أحمد محمد"
      />
    );

    // Component should render without errors with custom name
    expect(screen.getByTitle('نسخ الرابط')).toBeInTheDocument();
  });

  it('has RTL direction', () => {
    const { container } = render(
      <SocialShareButtons referralLink={mockReferralLink} />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('dir', 'rtl');
  });

  it('opens share windows with correct dimensions', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    const whatsappButton = screen.getByTitle('مشاركة على واتس آب');
    fireEvent.click(whatsappButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      'width=600,height=400'
    );
  });

  it('renders button labels on desktop screens', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    // The labels should be present (hidden on mobile, shown on desktop)
    expect(screen.getByText('نسخ الرابط')).toBeInTheDocument();
  });

  it('includes referral link in share messages', () => {
    render(<SocialShareButtons referralLink={mockReferralLink} />);

    const twitterButton = screen.getByTitle('مشاركة على تويتر');
    fireEvent.click(twitterButton);

    const callArgs = mockOpen.mock.calls[0][0];
    expect(callArgs).toContain(encodeURIComponent(mockReferralLink));
  });
});
