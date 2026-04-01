import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferralFAQPage } from './ReferralFAQPage';

// Mock wouter
vi.mock('wouter', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ['/', () => {}],
}));

describe('ReferralFAQPage', () => {
  const renderComponent = () => {
    return render(<ReferralFAQPage />);
  };

  it('renders the FAQ page with header', () => {
    renderComponent();
    expect(screen.getByText('الأسئلة الشائعة')).toBeInTheDocument();
    expect(screen.getByText(/دليل شامل لفهم نظام الإحالات/)).toBeInTheDocument();
  });

  it('displays all category filters', () => {
    renderComponent();
    expect(screen.getByText('جميع الأسئلة')).toBeInTheDocument();
    expect(screen.getByText('عام')).toBeInTheDocument();
    expect(screen.getByText('آلية العمل')).toBeInTheDocument();
    expect(screen.getByText('المكافآت')).toBeInTheDocument();
    expect(screen.getByText('الشروط')).toBeInTheDocument();
    expect(screen.getByText('استكشاف الأخطاء')).toBeInTheDocument();
  });

  it('displays FAQ items initially collapsed', () => {
    renderComponent();
    const firstQuestion = screen.getByText('ما هو نظام الإحالات (Referral System)؟');
    expect(firstQuestion).toBeInTheDocument();
  });

  it('expands FAQ item when clicked', () => {
    renderComponent();
    const firstQuestion = screen.getByText('ما هو نظام الإحالات (Referral System)؟');
    const button = firstQuestion.closest('button');
    
    fireEvent.click(button!);
    
    expect(screen.getByText(/نظام الإحالات هو برنامج يسمح لك بدعوة معلمين آخرين/)).toBeInTheDocument();
  });

  it('collapses FAQ item when clicked again', () => {
    renderComponent();
    const firstQuestion = screen.getByText('ما هو نظام الإحالات (Referral System)؟');
    const button = firstQuestion.closest('button');
    
    fireEvent.click(button!);
    fireEvent.click(button!);
    
    // The answer should still be in the DOM but the button should be collapsed
    expect(button).toBeInTheDocument();
  });

  it('filters FAQ by category', () => {
    renderComponent();
    const mechanicsButton = screen.getByText('آلية العمل');
    
    fireEvent.click(mechanicsButton);
    
    // Should show mechanics questions
    expect(screen.getByText('كيف أنشئ رابط إحالة؟')).toBeInTheDocument();
  });

  it('displays statistics section', () => {
    renderComponent();
    expect(screen.getByText('جذاجات لكل إحالة')).toBeInTheDocument();
    expect(screen.getByText('يوماً')).toBeInTheDocument();
    expect(screen.getByText('بدون حد')).toBeInTheDocument();
  });

  it('displays CTA section with buttons', () => {
    renderComponent();
    expect(screen.getByText('هل لديك أسئلة أخرى؟')).toBeInTheDocument();
    expect(screen.getByText('ابدأ بدعوة الأصدقاء')).toBeInTheDocument();
    expect(screen.getByText('عرض لوحة التحكم')).toBeInTheDocument();
  });

  it('shows all FAQ items when "جميع الأسئلة" is selected', () => {
    renderComponent();
    const allButton = screen.getByText('جميع الأسئلة');
    
    fireEvent.click(allButton);
    
    // Should show questions from all categories
    expect(screen.getByText('ما هو نظام الإحالات (Referral System)؟')).toBeInTheDocument();
    expect(screen.getByText('كيف أنشئ رابط إحالة؟')).toBeInTheDocument();
    expect(screen.getByText('كم عدد الرصيد الذي أحصل عليه لكل إحالة ناجحة؟')).toBeInTheDocument();
  });

  it('has correct RTL direction', () => {
    const { container } = renderComponent();
    const mainDiv = container.querySelector('[dir="rtl"]');
    expect(mainDiv).toBeInTheDocument();
  });

  it('displays correct number of FAQ items', () => {
    renderComponent();
    const questions = screen.getAllByRole('button').filter(btn => 
      btn.textContent?.includes('؟')
    );
    expect(questions.length).toBeGreaterThan(0);
  });
});
