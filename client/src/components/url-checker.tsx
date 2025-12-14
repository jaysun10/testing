import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { checkWebsiteSchema, type CheckWebsiteInput, type WebsiteCheckResult } from "@shared/schema";
import { trackWebsiteCheck } from "@/lib/analytics";
import { apiRequest } from "@/lib/queryClient";

interface UrlCheckerProps {
  onResult: (result: WebsiteCheckResult) => void;
}

export function UrlChecker({ onResult }: UrlCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);

  const form = useForm<CheckWebsiteInput>({
    resolver: zodResolver(checkWebsiteSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (data: CheckWebsiteInput) => {
    setIsChecking(true);
    try {
      const result = await apiRequest<WebsiteCheckResult>("POST", "/api/check", data);
      trackWebsiteCheck(data.url, result.loadTime, result.status);
      onResult(result);
    } catch (error) {
      console.error("Error checking website:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="mx-auto max-w-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Globe className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold">Check Website Performance</h2>
            <p className="mt-2 text-muted-foreground">
              Enter any URL to analyze its speed, uptime, and performance metrics
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="https://example.com"
                            className="h-14 pl-12 text-lg"
                            data-testid="input-url"
                          />
                        </div>
                        <Button
                          type="submit"
                          size="lg"
                          className="h-14 px-8"
                          disabled={isChecking}
                          data-testid="button-check"
                        >
                          {isChecking ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            "Analyze"
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Supports HTTP and HTTPS URLs. Results include load time, status code, and performance score.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
