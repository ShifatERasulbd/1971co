import { featuresFontClass } from '../../utils/typography';
import ContactInformationPanel from './ContactInformationPanel.jsx';
import ContactLocationCards from './ContactLocationCards.jsx';
import ContactQuestionForm from './ContactQuestionForm.jsx';

export default function ContactSection() {
    return (
        <section className={`${featuresFontClass} bg-[#f5f5f3] py-14 sm:py-18 lg:py-24`}>
            <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
                    <ContactInformationPanel />
                    <ContactQuestionForm />
                </div>

                <ContactLocationCards />
            </div>
        </section>
    );
}
