import Navbar from "./Navbar";
import Hero from "./Hero";
import Card from "./Card";
import Footer from "./Footer";

const features = [
  {
    title: "AI Description Generation",
    description:
      "Generate product descriptions using AI."
  },
  {
    title: "Multiple Writing Tones",
    description:
      "Choose Premium, Traditional or Health-Focused."
  },
  {
    title: "SEO Keywords",
    description:
      "Receive keyword suggestions for listings."
  },
  {
    title: "Regenerate Content",
    description:
      "Create alternative versions instantly."
  },
  {
    title: "Edit Before Copying",
    description:
      "Modify generated descriptions easily."
  },
  {
    title: "Description History",
    description:
      "Store and reuse previous descriptions."
  }
];

const Home = () => {
  return (
    <>
      <Navbar />

      <Hero />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;