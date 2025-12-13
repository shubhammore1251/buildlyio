import { ProjectForm } from "@/modules/home/ui/components/project-form";
import Image from "next/image";

const Page = () => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-8 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="BuildlyIO"
            width={80}
            height={80}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something with{" "}
          <span className="bg-gradient-to-r from-violet-700 to-indigo-500 bg-clip-text text-transparent">
            buildly.io
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center font-medium">
          Create apps and websites by chatting with AI
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
    </div>
  );
};

export default Page;
