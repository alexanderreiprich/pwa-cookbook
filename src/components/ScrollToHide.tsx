import { Slide, useScrollTrigger } from "@mui/material"

const ScrollToHide = (props: any) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: props.threshold,
    target: props.window
  });

  return (
    <Slide appear={true} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
}

export default ScrollToHide;