import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  Globe, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Monitor
} from "lucide-react";
import { addWebsiteSchema, type AddWebsiteInput, type MonitoredWebsite, type WebsiteCheckResult } from "@shared/schema";
import { trackWebsiteAdded } from "@/lib/analytics";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MonitoredWebsitesProps {
  websites: MonitoredWebsite[];
  onAdd: (website: MonitoredWebsite) => void;
  onRemove: (id: string) => void;
  onRefresh: (id: string) => void;
  onSelect: (website: MonitoredWebsite) => void;
}

export function MonitoredWebsites({ 
  websites, 
  onAdd, 
  onRemove, 
  onRefresh,
  onSelect 
}: MonitoredWebsitesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  const form = useForm<AddWebsiteInput>({
    resolver: zodResolver(addWebsiteSchema),
    defaultValues: {
      url: "",
      name: "",
    },
  });

  const handleAdd = async (data: AddWebsiteInput) => {
    setIsAdding(true);
    try {
      const result = await apiRequest<MonitoredWebsite>("POST", "/api/websites", data);
      trackWebsiteAdded(data.url);
      onAdd(result);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding website:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRefresh = async (id: string) => {
    setRefreshingIds(prev => new Set(prev).add(id));
    try {
      await onRefresh(id);
    } finally {
      setRefreshingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Online</Badge>;
      case "offline":
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Monitored Websites</CardTitle>
              <p className="text-sm text-muted-foreground">{websites.length} websites tracked</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-website">
                <Plus className="mr-2 h-4 w-4" />
                Add Website
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Website to Monitor</DialogTitle>
                <DialogDescription>
                  Enter the website URL and a friendly name to start monitoring its performance.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="My Website" 
                            data-testid="input-website-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://example.com" 
                            data-testid="input-website-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isAdding}
                    data-testid="button-submit-website"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Website"
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {websites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">No websites monitored yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a website to start tracking its performance
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {websites.map((website, index) => (
                  <motion.div
                    key={website.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center justify-between gap-4 rounded-lg border p-4 hover-elevate cursor-pointer"
                    onClick={() => onSelect(website)}
                    data-testid={`card-website-${website.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                        {getStatusIcon(website.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{website.name}</p>
                          {getStatusBadge(website.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {website.url}
                        </p>
                        {website.lastCheck && (
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {website.lastCheck.loadTime}ms
                            </span>
                            <span>Score: {website.lastCheck.performanceScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRefresh(website.id)}
                        disabled={refreshingIds.has(website.id)}
                        data-testid={`button-refresh-${website.id}`}
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingIds.has(website.id) ? "animate-spin" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(website.url, "_blank")}
                        data-testid={`button-open-${website.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(website.id)}
                        className="text-destructive"
                        data-testid={`button-remove-${website.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
