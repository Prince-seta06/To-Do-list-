import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConfettiSettings, ConfettiShape } from "../contexts/ConfettiContext";

interface ConfettiSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ConfettiSettings;
  onSave: (settings: ConfettiSettings) => void;
}

const ConfettiSettingsModal = ({
  open,
  onOpenChange,
  settings,
  onSave
}: ConfettiSettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<ConfettiSettings>({...settings});
  const { toast } = useToast();
  
  // Reset local settings when modal opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalSettings({...settings});
    }
    onOpenChange(open);
  };
  
  const handleSave = () => {
    onSave(localSettings);
    toast({
      title: "Settings saved",
      description: "Your confetti settings have been updated.",
    });
    onOpenChange(false);
  };
  
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...localSettings.colors];
    newColors[index] = value;
    setLocalSettings({...localSettings, colors: newColors});
  };
  
  const addColor = () => {
    if (localSettings.colors.length < 10) {
      setLocalSettings({
        ...localSettings, 
        colors: [...localSettings.colors, '#ffffff']
      });
    }
  };
  
  const removeColor = (index: number) => {
    if (localSettings.colors.length > 1) {
      const newColors = [...localSettings.colors];
      newColors.splice(index, 1);
      setLocalSettings({...localSettings, colors: newColors});
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confetti Settings</DialogTitle>
          <DialogDescription>
            Customize your task completion celebration
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="confetti-enabled">Enable celebration</Label>
            <Switch 
              id="confetti-enabled" 
              checked={localSettings.enabled}
              onCheckedChange={(checked) => 
                setLocalSettings({...localSettings, enabled: checked})
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confetti-duration">Duration (ms): {localSettings.duration}</Label>
            <Slider 
              id="confetti-duration"
              min={500}
              max={10000}
              step={500}
              value={[localSettings.duration]}
              onValueChange={(value) => 
                setLocalSettings({...localSettings, duration: value[0]})
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confetti-pieces">Number of pieces: {localSettings.numberOfPieces}</Label>
            <Slider 
              id="confetti-pieces"
              min={50}
              max={500}
              step={10}
              value={[localSettings.numberOfPieces]}
              onValueChange={(value) => 
                setLocalSettings({...localSettings, numberOfPieces: value[0]})
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="confetti-recycle">Continuous effect</Label>
            <Switch 
              id="confetti-recycle" 
              checked={localSettings.recycle}
              onCheckedChange={(checked) => 
                setLocalSettings({...localSettings, recycle: checked})
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confetti-shape">Confetti Shape</Label>
            <Select
              value={localSettings.shape}
              onValueChange={(value: ConfettiShape) => 
                setLocalSettings({...localSettings, shape: value})
              }
            >
              <SelectTrigger id="confetti-shape" className="w-full">
                <SelectValue placeholder="Select shape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="star">Star</SelectItem>
                <SelectItem value="heart">Heart</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Confetti Colors</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addColor}
                disabled={localSettings.colors.length >= 10}
              >
                Add Color
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-2">
              {localSettings.colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input 
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeColor(index)}
                    disabled={localSettings.colors.length <= 1}
                    className="px-2"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfettiSettingsModal;