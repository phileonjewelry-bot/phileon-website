import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-black/95 text-white border-[#C6A24A]/30 shadow-lg backdrop-blur-sm",
          description: "text-white/70",
          actionButton:
            "bg-[#C6A24A] text-black",
          cancelButton:
            "bg-white/10 text-white",
          success: "bg-black/95 border-[#C6A24A]/50",
        },
        duration: 3000,
      }}
      {...props} />
  );
}

export { Toaster, toast }
